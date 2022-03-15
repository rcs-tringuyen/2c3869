# Generated by Django 3.2.4 on 2022-03-15 02:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messenger_backend', '0006_conversationgroup'),
    ]

    operations = [
        migrations.AlterField(
            model_name='conversationgroup',
            name='users',
            field=models.ManyToManyField(blank=True, db_column='userIds', null=True, related_name='_messenger_backend_conversationgroup_users_+', to='messenger_backend.User'),
        ),
    ]
