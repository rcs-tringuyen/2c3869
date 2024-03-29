from django.contrib.auth.middleware import get_user
from django.http import HttpResponse, JsonResponse
from messenger_backend.models import Conversation, Message
from online_users import online_users
from rest_framework.views import APIView


class Messages(APIView):
    """expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)"""

    def post(self, request):
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)

            sender_id = user.id
            body = request.data
            conversation_id = body.get("conversationId")
            text = body.get("text")
            recipient_id = body.get("recipientId")
            sender = body.get("sender")

            # if we already know conversation id, we can save time and just add it to message and return
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id).first()
                message = Message(
                    senderId=sender_id, text=text, conversation=conversation, isRead=False
                )
                message.save()
                message_json = message.to_dict()
                return JsonResponse({"message": message_json, "sender": body["sender"]})

            # if we don't have conversation id, find a conversation to m       ake sure it doesn't already exist
            conversation = Conversation.find_conversation(sender_id, recipient_id)
            if not conversation:
                # create conversation
                conversation = Conversation(user1_id=sender_id, user2_id=recipient_id)
                conversation.save()

                if sender and sender["id"] in online_users:
                    sender["online"] = True

            message = Message(senderId=sender_id, text=text, conversation=conversation, isRead=False)
            message.save()
            message_json = message.to_dict()
            return JsonResponse({"message": message_json, "sender": sender})
        except Exception as e:
            return HttpResponse(status=500)

    def put(self, request):
        # Update the read status
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)

            body = request.data
            conversation_id = body.get("conversationId")
            message_id = body.get("messageId")
            is_read = body.get("isRead")

            # if we already know conversation id, we can save time and just add it to message and return
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id).first()
                
                # Unauthorized user tampering the conversation
                if (user.id != conversation.user1.id and user.id != conversation.user2.id):
                    return HttpResponse(status=403)

                last_message = Message.objects.get(
                    conversation=conversation, id=message_id
                )
                last_message.isRead = is_read # is_read will be True
                last_message.save()

                # All the previous message in the conversation must also have been read
                conversation.messages.all().update(isRead=True)

                return HttpResponse(status=204)

        except Exception as e:
            return HttpResponse(status=500)
