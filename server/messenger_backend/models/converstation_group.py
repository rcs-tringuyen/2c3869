from django.db import models
from django.db.models import Count

from . import utils
from .user import User


class ConversationGroup(utils.CustomModel):

    users = models.ManyToManyField(
        User, db_column="userIds", related_name="+", blank=True, null=True
    )
    createdAt = models.DateTimeField(auto_now_add=True, db_index=True)
    updatedAt = models.DateTimeField(auto_now=True)

    # find conversation given two user Ids
    def find_conversation(userIds):
        # return conversation or None if it doesn't exist
        try:
            conversation_query = ConversationGroup.objects.annotate(count=Count("users")).filter(count=len(userIds))
            for userId in userIds:
                conversation_query = conversation_query.filter(users__pk=userId)
            return conversation_query.first()
        except ConversationGroup.DoesNotExist:
            return None