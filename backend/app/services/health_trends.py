def calculate_health_trend(current_score, previous_score):
    if previous_score is None:
        return "First report uploaded."

    if current_score > previous_score:
        return "Health is improving."

    elif current_score < previous_score:
        return "Health is declining."

    return "Health is stable."