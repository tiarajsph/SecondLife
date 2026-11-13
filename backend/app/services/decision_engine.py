
def get_recommendation(predicted_price: float, asking_price: float) -> str:
    """
    Compare the predicted resale price with the seller's asking price.

    BUY:
        Asking price <= predicted resale price

    NEGOTIATE:
        Predicted resale price < asking price
        and asking price <= 110% of predicted resale price

    PASS:
        Asking price > 110% of predicted resale price
    """

    if predicted_price <= 0:
        raise ValueError("Predicted price must be greater than zero.")

    if asking_price <= 0:
        raise ValueError("Asking price must be greater than zero.")

    if asking_price <= predicted_price:
        return "BUY"

    elif asking_price <= predicted_price * 1.10:
        return "NEGOTIATE"

    else:
        return "PASS"


def calculate_price_difference(predicted_price: float, asking_price: float) -> dict:
    if predicted_price <= 0:
        raise ValueError("Predicted price must be greater than zero.")

    if asking_price <= 0:
        raise ValueError("Asking price must be greater than zero.")

    difference = predicted_price - asking_price
    difference_pct = (difference / predicted_price) * 100

    return {
        "difference_inr": round(difference, 2),
        "difference_pct": round(difference_pct, 2)
    }
