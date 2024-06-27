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
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

# Create your views here.
def login_view(request):
    """
        Handles user login.

        If the request method is POST, it attempts to authenticate the user with the provided username and password.
        If the authentication is successful, it logs the user in and redirects them to the index page.
        If the authentication fails, it renders the login page with an error message.

        Args:
            request: The HTTP request object.

        Returns:
            An HTTP response object.

        Example:
            curl -X POST -d "username=johndoe&password=password123" http://localhost:8000/login/
    """
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
    """
        Handles user logout.

        Logs the user out and redirects them to the login page.

        Args:
            request: The HTTP request object.

        Returns:
            An HTTP response object.

        Example:
            curl -X GET http://localhost:8000/logout/
    """
    logout(request)
    return HttpResponseRedirect(reverse("login"))

def register(request):
    """
    Handles user registration.

    If the request method is POST, it attempts to create a new user with the provided username, email, and password.
    If the creation is successful, it logs the user in and redirects them to the index page.
    If the creation fails, it renders the registration page with an error message.

    Args:
        request: The HTTP request object.

    Returns:
        An HTTP response object.

    Example:
        curl -X POST -d "username=johndoe&email=johndoe@example.com&password=password123&confirmation=password123" http://localhost:8000/register/
    """
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
    """
        Retrieves a single task.

        Args:
            pk: The primary key of the task.

        Returns:
            A serialized task object.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
class TaskListView(generics.ListCreateAPIView):
    """
        Lists all tasks or creates a new task.

        Args:
            request: The HTTP request object.

        Returns:
            A list of serialized task objects or a serialized task object.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['priority', 'due_date', 'category']
    ordering_fields = ['priority', 'due_date', 'category']

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
    """
        Deletes a task.

        Args:
            pk: The primary key of the task.

        Returns:
            A success message.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(assigned_to=self.request.user)
    
class UpdateTaskView(generics.RetrieveUpdateAPIView):
    """
        updates a task.

        Args:
            pk: The primary key of the task.

        Returns:
            A success message.
    """
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
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['priority', 'due_date', 'category']
    ordering_fields = ['priority', 'due_date', 'category']

    def get_queryset(self):
        user = self.request.user
        tasks = Task.objects.filter(assigned_to=user, status='IP')
        return tasks
    
    def list(self, request, *args, **kwargs):
        
        queryset = self.get_queryset()
        # serializer = self.get_serializer(queryset, many=True)
        user = request.user
        inprogress_count = Task.objects.filter(assigned_to=user, status='IP').count()
        filtered_queryset = self.filter_queryset(queryset)
        # print(filtered_queryset.query)  # Print the SQL query for debugging

        serializer = self.get_serializer(filtered_queryset, many=True)
        
        inprogress_count = filtered_queryset.count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'inprogress_count': inprogress_count
        }
        return Response(response_data)

class CompletedTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['priority', 'due_date', 'category']
    ordering_fields = ['priority', 'due_date', 'category']

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user, status='CO')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user = request.user
        completed_count = Task.objects.filter(assigned_to=user, status='CO').count()
        filtered_queryset = self.filter_queryset(queryset)  # Print the SQL query for debugging

        serializer = self.get_serializer(filtered_queryset, many=True)
        
        completed_count = filtered_queryset.count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'completed_count': completed_count
        }
        return Response(response_data)

class OverdueTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['priority', 'due_date', 'category']
    ordering_fields = ['priority', 'due_date', 'category']

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(assigned_to=user, status='OV')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        user = request.user
        overdue_count = Task.objects.filter(assigned_to=user, status='OV').count()
        filtered_queryset = self.filter_queryset(queryset)

        serializer = self.get_serializer(filtered_queryset, many=True)
        
        overdue_count = filtered_queryset.count()

        # Create a response structure that includes both tasks and the count
        response_data = {
            'tasks': serializer.data,
            'overdue_count': overdue_count
        }
        return Response(response_data)
    
