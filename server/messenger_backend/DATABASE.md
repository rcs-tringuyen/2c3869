```python3
python manage.py dumpdata messenger_backend.conversation --indent 2 -o conversation.json
python -Xutf8 manage.py dumpdata messenger_backend.message --indent 2 -o message.json
python database_migration.py
```
