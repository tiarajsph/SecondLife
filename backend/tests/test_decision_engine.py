
import pytest

from app.services.decision_engine import (
    get_recommendation,
    calculate_price_difference,
)


@pytest.mark.parametrize(
    "asking_price, expected",
    [
        (45000, "BUY"),
        (50000, "BUY"),
        (50001, "NEGOTIATE"),
        (53000, "NEGOTIATE"),
        (55000, "NEGOTIATE"),
        (55001, "PASS"),
        (58000, "PASS"),
    ],
)
def test_get_recommendation(asking_price, expected):
    result = get_recommendation(
        predicted_price=50000,
        asking_price=asking_price,
    )

    assert result == expected


def test_calculate_price_difference():
    result = calculate_price_difference(
        predicted_price=50000,
        asking_price=45000,
    )

    assert result["difference_inr"] == 5000
    assert result["difference_pct"] == 10


def test_price_above_predicted_value():
    result = calculate_price_difference(
        predicted_price=50000,
        asking_price=55000,
    )

    assert result["difference_inr"] == -5000
    assert result["difference_pct"] == -10


@pytest.mark.parametrize(
    "predicted_price, asking_price",
    [
        (0, 50000),
        (-100, 50000),
        (50000, 0),
        (50000, -100),
    ],
)
def test_invalid_prices(predicted_price, asking_price):
    with pytest.raises(ValueError):
        get_recommendation(predicted_price, asking_price)


def test_invalid_predicted_price_in_difference():
    with pytest.raises(ValueError):
        calculate_price_difference(0, 50000)