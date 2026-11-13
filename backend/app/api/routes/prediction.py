
from fastapi import APIRouter

from app.schemas.phone import (
    PhoneInput,
    PredictionResponse,
    EvaluationInput,
    EvaluationResponse,
)

from app.services.predictor import predict_resale_price
from app.services.decision_engine import (
    get_recommendation,
    calculate_price_difference,
)

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/", response_model=PredictionResponse)
def predict_price(phone: PhoneInput):
    phone_data = phone.model_dump()
    result = predict_resale_price(phone_data)
    return result


@router.post("/evaluate/", response_model=EvaluationResponse)
def evaluate_phone(phone: EvaluationInput):
    # Separate the asking price from the ML input.
    phone_data = phone.model_dump(exclude={"asking_price_inr"})
    asking_price = phone.asking_price_inr

    # Predict the phone's resale value.
    prediction = predict_resale_price(phone_data)
    predicted_price = prediction["predicted_resale_price_inr"]

    # Calculate price difference.
    difference = calculate_price_difference(
        predicted_price=predicted_price,
        asking_price=asking_price,
    )

    # Generate recommendation.
    recommendation = get_recommendation(
        predicted_price=predicted_price,
        asking_price=asking_price,
    )

    return {
        "predicted_resale_price_inr": predicted_price,
        "asking_price_inr": asking_price,
        "difference_inr": difference["difference_inr"],
        "difference_pct": difference["difference_pct"],
        "recommendation": recommendation,
        "currency": "INR",
    }
