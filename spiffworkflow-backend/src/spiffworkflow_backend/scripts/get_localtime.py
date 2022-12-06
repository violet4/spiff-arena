"""Get_localtime."""
from datetime import datetime
from flask_bpmn.api.api_error import ApiError
from typing import Any

import pytz

from spiffworkflow_backend.models.script_attributes_context import (
    ScriptAttributesContext,
)
from spiffworkflow_backend.scripts.script import Script


class GetLocaltime(Script):
    """GetLocaltime."""

    def get_description(self) -> str:
        """Get_description."""
        return """Converts a Datetime object into a Datetime object for a specific timezone.
        Defaults to US/Eastern."""

    def run(
        self,
        script_attributes_context: ScriptAttributesContext,
        *args: Any,
        **kwargs: Any
    ) -> datetime:
        """Run."""
        if len(args) > 0 or "datetime" in kwargs:
            if "datetime" in kwargs:
                date_time = kwargs["datetime"]
            else:
                date_time = args[0]
            if "timezone" in kwargs:
                timezone = kwargs["timezone"]
            elif len(args) > 1:
                timezone = args[1]
            else:
                timezone = "US/Eastern"
            localtime: datetime = date_time.astimezone(pytz.timezone(timezone))
            return localtime

        else:
            raise ApiError(
                error_code="missing_datetime",
                message="You must include a datetime to convert.",
            )
