
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app

client = TestClient(app)


# Valid baseline phone used across prediction tests
VALID_PHONE = {
    "brand": "Samsung",
    "model": "Galaxy S23",
    "launch_price_inr": 74999,
    "age_years": 1,
    "ram_gb": 8,
    "storage_gb": 128,
    "battery_health_pct": 90,
    "condition": "Excellent",
    "screen_crack": "No",
    "scratches": "Minor",
    "box": "Yes",
    "charger": "Yes",
    "invoice": "Yes",
    "warranty": "No",
    "city": "Pune",
    "seller_type": "Individual"
}


def test_home_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_valid_prediction():
    response = client.post("/predict/", json=VALID_PHONE)

    assert response.status_code == 200

    data = response.json()

    assert "predicted_resale_price_inr" in data
    assert "currency" in data
    assert data["currency"] == "INR"
    assert isinstance(data["predicted_resale_price_inr"], (int, float))
    assert data["predicted_resale_price_inr"] > 0


def test_invalid_battery_health():
    phone = VALID_PHONE.copy()
    phone["battery_health_pct"] = 150

    response = client.post("/predict/", json=phone)

    assert response.status_code == 422


def test_zero_ram():
    phone = VALID_PHONE.copy()
    phone["ram_gb"] = 0

    response = client.post("/predict/", json=phone)

    assert response.status_code == 422


def test_missing_required_field():
    phone = VALID_PHONE.copy()
    del phone["battery_health_pct"]

    response = client.post("/predict/", json=phone)

    assert response.status_code == 422


def test_invalid_condition():
    phone = VALID_PHONE.copy()
    phone["condition"] = "Broken"

    response = client.post("/predict/", json=phone)

    assert response.status_code == 422


def test_negative_age():
    phone = VALID_PHONE.copy()
    phone["age_years"] = -1

    response = client.post("/predict/", json=phone)

    assert response.status_code == 422


def test_unknown_brand_is_accepted():
    phone = VALID_PHONE.copy()
    phone["brand"] = "UnknownBrand"
    phone["model"] = "TestPhone X1"

    response = client.post("/predict/", json=phone)

    assert response.status_code == 200


def test_cors_preflight():
    response = client.options(
        "/predict/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "http://localhost:5173"
    )

def test_valid_evaluation():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 30000

    response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 200

    data = response.json()

    assert "predicted_resale_price_inr" in data
    assert "asking_price_inr" in data
    assert "difference_inr" in data
    assert "difference_pct" in data
    assert "recommendation" in data
    assert data["asking_price_inr"] == 30000
    assert data["recommendation"] in ["BUY", "NEGOTIATE", "PASS"]
    assert data["currency"] == "INR"


def test_evaluation_rejects_zero_asking_price():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 0

    response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 422


def test_evaluation_rejects_negative_asking_price():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = -1000

    response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 422


def test_evaluation_missing_asking_price():
    response = client.post("/predict/evaluate/", json=VALID_PHONE)

    assert response.status_code == 422


def test_evaluation_excludes_asking_price_from_ml_input():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 30000

    with patch(
        "app.api.routes.prediction.predict_resale_price"
    ) as mock_predict:

        mock_predict.return_value = {
            "predicted_resale_price_inr": 40000,
            "currency": "INR",
        }

        response = client.post("/predict/evaluate/", json=phone)

        assert response.status_code == 200

        ml_input = mock_predict.call_args.args[0]

        assert "asking_price_inr" not in ml_input
        assert len(ml_input) == 16


def test_evaluation_buy_recommendation():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 30000

    with patch(
        "app.api.routes.prediction.predict_resale_price"
    ) as mock_predict:

        mock_predict.return_value = {
            "predicted_resale_price_inr": 40000,
            "currency": "INR",
        }

        response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 200
    assert response.json()["recommendation"] == "BUY"


def test_evaluation_negotiate_recommendation():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 42000

    with patch(
        "app.api.routes.prediction.predict_resale_price"
    ) as mock_predict:

        mock_predict.return_value = {
            "predicted_resale_price_inr": 40000,
            "currency": "INR",
        }

        response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 200
    assert response.json()["recommendation"] == "NEGOTIATE"


def test_evaluation_pass_recommendation():
    phone = VALID_PHONE.copy()
    phone["asking_price_inr"] = 45000

    with patch(
        "app.api.routes.prediction.predict_resale_price"
    ) as mock_predict:

        mock_predict.return_value = {
            "predicted_resale_price_inr": 40000,
            "currency": "INR",
        }

        response = client.post("/predict/evaluate/", json=phone)

    assert response.status_code == 200
    assert response.json()["recommendation"] == "PASS"
