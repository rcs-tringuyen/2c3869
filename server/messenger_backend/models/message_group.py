from django.db import models
from django.contrib.postgres.fields import ArrayField

from . import utils
from .converstation_group import ConversationGroup


class MessageGroup(utils.CustomModel):
    text = models.TextField(null=False)
    senderId = models.IntegerField(null=False)
    conversation = models.ForeignKey(
        ConversationGroup,
        on_delete=models.CASCADE,
        db_column="conversationId",
        related_name="messages",
        related_query_name="message"
    )
    createdAt = models.DateTimeField(auto_now_add=True, db_index=True)
    updatedAt = models.DateTimeField(auto_now=True)
    isRead = ArrayField(models.IntegerField(null=False), null=True, blank=True)
