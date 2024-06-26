from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.db import IntegrityError
from .models import User, Task
from .serializers import TaskSerializer
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.
def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "frontend/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "frontend/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "frontend/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "frontend/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "frontend/register.html")

class TaskDetailView(generics.RetrieveAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user)
    
    def perform_create(self, serializer):
        user = self.request.user
        title = serializer.validated_data.get('title')
        if Task.objects.filter(title=title, assigned_to=user).exists():
            raise serializers.ValidationError("You already have a task with this title.")
        
        if serializer.is_valid():
            return serializer.save(assigned_to=user)
        else:
            return serializer.errors()

class DeleteTaskView(generics.DestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)
    
class UpdateTaskView(generics.RetrieveUpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user)

    def perform_update(self, serializer):
        user = self.request.user
        title = serializer.validated_data.get('title')
        instance_id = self.get_object().id

        if Task.objects.filter(title=title, assigned_to=user).exclude(id=instance_id).exists():
            raise serializers.ValidationError("You already have a task with this title.")
        
        serializer.save(assigned_to=user)

class InProgressTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tasks = Task.objects.filter(assigned_to=user, status='IP')
        return tasks
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user = request.user
        inprogress_count = Task.objects.filter(assigned_to=user, status='IP').count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'inprogress_count': inprogress_count
        }
        return Response(response_data)

class CompletedTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user, status='CO')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user = request.user
        completed_count = Task.objects.filter(assigned_to=user, status='CO').count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'completed_count': completed_count
        }
        return Response(response_data)

class OverdueTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user, status='OV')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user = request.user
        overdue_count = Task.objects.filter(assigned_to=user, status='OV').count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'overdue_count': overdue_count
        }
        return Response(response_data)
    
class TaskSearchView(generics.ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        q = self.request.GET.get('q')
        return Task.objects.filter(title__icontains=q)