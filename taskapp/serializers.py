from taskapp.models import User, Task
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]

        #it tells django that we want to accept password when creating a new user but dont want to return password when giving the information about the user
        extra_kwargs = {"password": {"write_only":True}} 

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "title", 'description', 'status', 'priority', 'due_date', 'category', 'assigned_to']

