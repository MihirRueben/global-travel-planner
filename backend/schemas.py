from pydantic import BaseModel, Field
from typing import List

class ActivityEntity(BaseModel):
    time_of_day: str = Field(description="e.g., Morning, Afternoon, Evening")
    location: str = Field(description="Landmark or venue name")
    description: str = Field(description="Activity breakdown of what to experience")
    estimated_cost_local: str = Field(description="Local current cost symbol + amount")

class ItineraryDayEntity(BaseModel):
    day_number: int
    theme: str
    activities: List[ActivityEntity]

class ItineraryGenerationSchema(BaseModel):
    title: str
    total_days: int
    days: List[ItineraryDayEntity]
    