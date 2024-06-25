from taskapp.models import Task
from rest_framework import serializers
    
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", 'description', 'status', 'priority', 'due_date', 'category']
        read_only_fields = ['assigned_to']
