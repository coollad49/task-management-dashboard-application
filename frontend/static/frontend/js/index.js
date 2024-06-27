const in_progress_url = "http://localhost:8000/tasks/in_progress";
const completed_url = "http://localhost:8000/tasks/completed";
const overdue_url = "http://localhost:8000/tasks/overdue";

const statusMap = {
  'IP': 'In Progress',
  'CO': 'Completed',
  'OV': 'Overdue'
};

const priorityMap = {
  'HI': 'High',
  'LO': 'Low',
  'ME': 'Medium'
};

function updateTaskStatus(taskId, newStatus) {
  $.ajax({
      url: `http://localhost:8000/tasks/${taskId}/update/`,
      method: 'PATCH',
      contentType: 'application/json',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
      data: JSON.stringify({ status: newStatus }),
      success: function(data) {
          console.log('Task status updated successfully');
      },
      error: function(error) {
          console.error('Error updating task status:', error);
      }
  });
}

async function loadTasks(url, container, id) {
  const statusMap = {
    'IP': 'In Progress',
    'CO': 'Completed',
    'OV': 'Overdue'
  };
  
  const priorityMap = {
    'HI': 'High',
    'LO': 'Low',
    'ME': 'Medium'
  };

  try {
      const response = await $.ajax({
          url: url,
          method: 'GET'
      });

      $(container).empty();
      $(id).text(`(${response[id.replace("#", "")]})`)
      response.tasks.forEach(function(task) {
        const currentTime = new Date();
        const status = statusMap[task.status] || task.status; // Default to original if no match
        const priority = priorityMap[task.priority] || task.priority;
        const time = data_converter(task.due_date)
        const dueDate = new Date(task.due_date);
        if (task.status === 'IP' && dueDate < currentTime) {
          updateTaskStatus(task.id, 'OV')// Update status to Overdue
          loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
          loadTasks(completed_url, "#completed_task", "#completed_count")
          loadTasks(overdue_url, "#overdue_task", "#overdue_count")
        }
        const taskElement = `<div class="space-y-2 rounded-md task" data-id="${task.id}" data-status="${task.status}">
              <div class="flex justify-between">
                  <div class="bg-red-200 py-1 px-4 rounded-md text-red-900 font-bold">${priority}</div>
                  <div class="flex shadow-2xl shadow-black rounded-md space-x-2 text-center py-1 px-2 ">
                      <img src="static/frontend/img/clock.png" alt="" class="w-6 h-6">
                      <span class="text-violet-500 font-semibold">${time}</span>
                  </div>
                  <div class="bg-gray-500/20 text-center py-1 text-violet-500 font-medium rounded-md px-3">${task.category}</div>
              </div>
              <div class="bg-gray-500/20 px-2 py-4 space-y-3 shadow-xl">
                  <div class="flex justify-between">
                      <h1 class="font-medium text-xl">${task.title}</h1>
                      <img src="static/frontend/img/kebab-gray.png" alt="" class="w-6 h-6">
                  </div>
                  <div class="space-y-2">
                      <p class="text-gray-500">${task.description}</p>
                      <div class="border rounded-md border-gray-500/30 w-16 p-1 flex items-center justify-around">
                          <img src="static/frontend/img/task2.png" alt="" class="w-4 h-4">
                          <span class="text-gray-500">0/3</span>
                      </div>
                  </div>
                  <div class="flex items-center justify-around space-x-2">
                      <a href=""><img src="static/frontend/img/eye.png" alt="" class="w-8 h-8"></a>
                      <div class="delete-btn cursor-pointer" data-id="${task.id}"><img src="static/frontend/img/bin.png" alt="" class="w-8 h-8"></div>
                      <div class="edit-task-btn cursor-pointer" data-id="${task.id}"><img src="static/frontend/img/pen.png" alt="" class="w-8 h-8"></div>
                  </div>
              </div>
            </div>`;
          $(container).append(taskElement);
          $(".task").draggable({
              revert: "invalid",
              start: function(event, ui) {
                  $(this).addClass("dragging");
                  console.log("Task started dragging");
              },
              stop: function(event, ui) {
                  $(this).removeClass("dragging");
                  console.log("Task stopped dragging");
              }
          });
        
          $(".task-list").droppable({
              accept: ".task",
              drop: function(event, ui) {
                  var newStatus = $(this).attr("id");
                  var taskId = ui.draggable.data("id");
        
                  ui.draggable.detach().appendTo($(this)).css({top: 0, left: 0});
                  ui.draggable.attr("data-status", newStatus);
        
                  console.log("Task dropped on list " + newStatus);
                  console.log("Task ID: " + taskId);
        
                  // Send AJAX request to update task status
                  updateTaskStatus(taskId, newStatus);
              }
          });
      });

  } catch (error) {
      console.error('Error fetching tasks:', error);
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

$(document).ready(function () {
  $('#searchModal').hide()
 
  $('#searchInput').focus(function() {
    $('#searchModal').show();
  });

  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const cover = document.getElementById('cover');

  loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
  loadTasks(completed_url, "#completed_task", "#completed_count")
  loadTasks(overdue_url, "#overdue_task", "#overdue_count")

  btn.addEventListener("click", navToggle)
  cover.addEventListener("click", navToggle)
  
  function navToggle() {
    btn.classList.toggle('open')
    menu.classList.toggle('block')
    menu.classList.toggle('hidden')
    cover.classList.toggle('hidden')
  }

  $('#inprogress').click(function(){
    $('#in_progress_task').slideToggle();
  })

  $('#completed').click(function(){
    $('#completed_task').slideToggle();
  })

  $('#overdue').click(function(){
    $('#overdue_task').slideToggle();
  })

  $('#addtask-modal').hide();
  $('#editTaskModal').hide();
  $('#deleteModal').hide();
  $('#add-task').click(function(){
    $('#addtask-modal').show();
  })

  $('.close-btn').click(function(){
    $('#addtask-modal').hide();
    $('#editTaskModal').hide();
    $('#deleteModal').hide();
    $('#searchModal').hide();
  })

  $('#createTaskForm').on('submit', function(event) {
    event.preventDefault();

    const formData = {
        title: $('#title').val(),
        description: $('#description').val(),
        status: $('#status').val(),
        priority: $('#priority').val(),
        due_date: $('#due_date').val(),
        category: $('#category').val()
    };
    console.log(JSON.stringify(formData))
    $.ajax({
        url: 'http://localhost:8000/tasks/',  // Your API endpoint to create tasks
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')  // Include CSRF token if needed
        },
        success: function(response) {
            // Handle success (e.g., refresh the task list, close modal)
            alert('Task created successfully');
            $('#addtask-modal').hide();
            // Reload the task list
            loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
            loadTasks(completed_url, "#completed_task", "#completed_count")
            loadTasks(overdue_url, "#overdue_task", "#overdue_count")  
        },
        error: function(xhr, status, error) {
            // Handle error
            alert('Error creating task: ' + error);
        }
    });
  });

  $('#editTaskForm').on('submit', function(event) {
      event.preventDefault();

      const taskId = $('#editId').val();
      console.log(taskId)
      const formData = {
        title: $('#editTitle').val(),
        description: $('#editDescription').val(),
        status: $('#editStatus').val(),
        priority: $('#editPriority').val(),
        due_date: $('#edit_Due_date').val(),
        category: $('#editCategory').val()
    };

      $.ajax({
          url: 'http://localhost:8000/tasks/' + taskId + '/update/',
          method: 'PUT',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          headers: {
              'X-CSRFToken': getCookie('csrftoken')
          },
          success: function(response) {
              alert('Task updated successfully');
              $('#editTaskModal').hide();
              // Reload the task list
              loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
              loadTasks(completed_url, "#completed_task", "#completed_count")
              loadTasks(overdue_url, "#overdue_task", "#overdue_count")
          },
          error: function(xhr, status, error) {
              alert('Error updating task: ' + error);
          }
      });
  });

  let allTasks = [];

  function fetchTasks() {
    $.get('http://localhost:8000/tasks/', function(data) {
      allTasks = data; // Store the fetched tasks
      console.log(allTasks)
    });
  }

  function searchTasks(query) {
    const container = $('#taskContainer');
  
    if (query === '') {
      // Clear the container and fetch all tasks when search input is cleared
      container.empty();
      fetchTasks(); // Fetch all tasks again
    } else {
      const filteredTasks = allTasks.filter(task => {
        return task.title.toLowerCase().includes(query.toLowerCase()) ||
               task.description.toLowerCase().includes(query.toLowerCase()) ||
               task.category.toLowerCase().includes(query.toLowerCase());
      });
      displayTasks(filteredTasks); // Display the filtered tasks
    }
  }

  function displayTasks(tasks) {
    const container = $('#taskContainer');
    container.empty(); // Clear the container

    tasks.forEach(task => {
      const status = statusMap[task.status] || task.status; // Default to original if no match
      const priority = priorityMap[task.priority] || task.priority;
      const time = data_converter(task.due_date)
      const taskElement = `<div class="bg-white border rounded-md shadow-md p-4">
                            <h3 class="text-lg font-medium text-gray-900">${task.title}</h3>
                            <p class="text-sm text-gray-500 mb-2">${task.description}</p>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span class="status">Status: <span class="status-text">${status}</span></span>
                                <span class="priority">Priority: <span class="priority-text">${priority}</span></span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600 mt-2">
                                <span>Due Date: <span class="text-green-500">${time}</span></span>
                                <span class="category">Category: <span class="category-text">${task.category}</span></span>
                            </div>
                        </div>`
        container.append(taskElement);
    });
    updateTaskColors()
  }

  fetchTasks(); // Fetch tasks when the page loads

  $('#search').on('input', function() {
    const query = $(this).val();
    searchTasks(query); // Search tasks based on the input value
  });

});

function data_converter(dueDateStr) {
  // Convert due_date string to Date object (considering it's in UTC)
  const dueDate = new Date(dueDateStr);

  // Extract hours and minutes
  let hours = dueDate.getUTCHours(); // Get hours (24-hour format)
  let minutes = dueDate.getUTCMinutes(); // Get minutes

  // Determine AM or PM based on hours
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format minutes to always be two digits
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Format time string
  const timeStr = `${hours}:${minutes} ${ampm}`;

  return timeStr;
}


$(document).on('click', '.edit-task-btn', function(){
  const taskId = $(this).data('id');
  $('.edit-task-btn').click(function() {
    console.log(taskId)
    // Fetch task data and populate the form
    $.get('http://localhost:8000/tasks/' + taskId, function(data) {
        const dueDate = new Date(data.due_date);
        const formattedDueDate = dueDate.toISOString().slice(0, 16); // Get 'YYYY-MM-DDTHH:MM' format
        
        $('#editId').val(data.id)
        $('#editTitle').val(data.title);
        $('#editDescription').val(data.description);
        $('#edit_Due_date').val(formattedDueDate);
        $('#editStatus').val(data.status);
        $('#editPriority').val(data.priority);
        $('#editCategory').val(data.category);
        $('#editTaskModal').show();
    });
  });
});

$(document).on('click', '.delete-btn', function(){
  const taskId = $(this).data('id');
  $('#deleteModal').show();
  $('#deleteModalBtn').click(function() {
    console.log(taskId)
    if (true) {
        $.ajax({
            url: 'http://localhost:8000/tasks/' + taskId + '/delete/',
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                alert('Task deleted successfully');
                // Reload the task list
                loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
                loadTasks(completed_url, "#completed_task", "#completed_count")
                loadTasks(overdue_url, "#overdue_task", "#overdue_count")
                $('#deleteModal').hide()
            },
            error: function(xhr, status, error) {
                alert('Error deleting task: ' + error);
            }
        });
    }
  });
})

function drag_drop_feature(){
  
}

function updateTaskColors() {
  const tasks = document.querySelectorAll('#taskContainer > div');
  tasks.forEach(task => {
      const statusText = task.querySelector('.status-text').textContent;
      const priorityText = task.querySelector('.priority-text').textContent;
      // Update status color
      if (statusText === 'In Progress') {
          task.querySelector('.status-text').classList.add('text-blue-500');
      } else if (statusText === 'Completed') {
          task.querySelector('.status-text').classList.add('text-green-500');
      }

      // Update priority color
      if (priorityText === 'High') {
          task.querySelector('.priority-text').classList.add('text-red-500');
      } else if (priorityText === 'Medium') {
          task.querySelector('.priority-text').classList.add('text-yellow-500');
      } else if (priorityText === 'Low') {
          task.querySelector('.priority-text').classList.add('text-green-500');
      }

  });
}