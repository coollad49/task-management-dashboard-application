// This script handles the task management functionalities including loading tasks, updating task status, and handling UI interactions such as drag-and-drop, filtering, and sorting tasks.

const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
const in_progress_url = `${base_url}/tasks/in_progress`;
const completed_url = `${base_url}/tasks/completed`;
const overdue_url = `${base_url}/tasks/overdue`;

console.log(base_url);
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

const showAlert = (status, message)=>{
  if (status == 'success'){
    $("#message-success").text(message)
    $("#alert-success").show()

    setTimeout(()=>{
      $("#alert-success").fadeOut()
    }, 3000)
  }
  else if (status == 'danger'){
    $("#message-danger").text(message)
    $("#alert-danger").show()

    setTimeout(()=>{
      $("#alert-danger").fadeOut()
    }, 3000)

  }
}


/**
 * Updates the status of a task.
 *
 * This function sends an AJAX request to update the status of a task identified by its taskId.
 * The new status is provided as an argument, and an optional callback function can be executed
 * upon successful completion of the request.
 *
 * @param {number} taskId - The ID of the task to be updated.
 * @param {string} newStatus - The new status to be assigned to the task.
 * @param {function} [callback] - An optional callback function to be executed upon successful update.
 */
function updateTaskStatus(taskId, newStatus, callback) {
  $.ajax({
      url: `${base_url}/tasks/${taskId}/update/`,
      method: 'PATCH',
      contentType: 'application/json',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      },
      data: JSON.stringify({ status: newStatus }),
      success: function(data) {
          console.log('Task status updated successfully');
          if(callback){
            callback();
          }
      },
      error: function(error) {
          console.error('Error updating task status:', error);
      }
  });
}


/**
 * Loads tasks from a specified URL and updates the task container with the fetched tasks.
 *
 * This function sends an AJAX GET request to the provided URL to fetch tasks. It then updates
 * the specified container with the fetched tasks, and updates the task count in the specified
 * element. If a task is in progress and its due date has passed, the task status is updated to
 * 'Overdue' and the tasks are reloaded.
 *
 * @param {string} url - The URL to fetch tasks from.
 * @param {string} container - The selector for the container to update with the fetched tasks.
 * @param {string} id - The selector for the element to update with the task count.
 */
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
      if(response.length === 1){
        task = response[0];
        const currentTime = new Date();
        const status = statusMap[task.status] || task.status; // Default to original if no match
        const priority = priorityMap[task.priority] || task.priority;
        const time = date_converter(task.due_date)
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
        
                  console.log("Task dropped on list " + newStatus);
                  console.log("Task ID: " + taskId);
        
                  // Send AJAX request to update task status
                  updateTaskStatus(taskId, newStatus, function() {
                    // Reload tasks after status update
                    loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
                    loadTasks(completed_url, "#completed_task", "#completed_count")
                    loadTasks(overdue_url, "#overdue_task", "#overdue_count")
                });
                  
              }
          });

      }
      else{
        response.tasks.forEach(function(task) {
          const currentTime = new Date();
          const status = statusMap[task.status] || task.status; // Default to original if no match
          const priority = priorityMap[task.priority] || task.priority;
          const time = date_converter(task.due_date)
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
          
                    console.log("Task dropped on list " + newStatus);
                    console.log("Task ID: " + taskId);
          
                    // Send AJAX request to update task status
                    updateTaskStatus(taskId, newStatus, function() {
                      // Reload tasks after status update
                      loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
                      loadTasks(completed_url, "#completed_task", "#completed_count")
                      loadTasks(overdue_url, "#overdue_task", "#overdue_count")
                  });
                    
                }
            });
        });
      }
      

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

  $('#filterBtn').click(function(){
    filter();
  })

  $('#sortBtn').click(function(){
    sort();
  })
  $('#refresh').click(function(){
    loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
    loadTasks(completed_url, "#completed_task", "#completed_count")
    loadTasks(overdue_url, "#overdue_task", "#overdue_count")
  })
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
        url: `${base_url}/tasks/`,  // Your API endpoint to create tasks
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')  // Include CSRF token if needed
        },
        success: function(response) {
            // Handle success (e.g., refresh the task list, close modal)
            showAlert('success', 'Task created successfully')
            $('#addtask-modal').hide();
            document.getElementById("createTaskForm").reset();
            // Reload the task list
            loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
            loadTasks(completed_url, "#completed_task", "#completed_count")
            loadTasks(overdue_url, "#overdue_task", "#overdue_count")  
        },
        error: function(xhr, status, error) {
            // Handle error
            console.log('Error creating task: ' + error);
            showAlert('danger', 'Error creating task')
        }
    });
  });

  $('#editTaskForm').on('submit', function(event) {
      event.preventDefault();

      const taskId = $('#editId').val();
      const formData = {
        title: $('#editTitle').val(),
        description: $('#editDescription').val(),
        status: $('#editStatus').val(),
        priority: $('#editPriority').val(),
        due_date: $('#edit_Due_date').val(),
        category: $('#editCategory').val()
    };

      $.ajax({
          url: `${base_url}/tasks/` + taskId + '/update/',
          method: 'PUT',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          headers: {
              'X-CSRFToken': getCookie('csrftoken')
          },
          success: function(response) {
              showAlert('success', 'Task updated successfully')
              $('#editTaskModal').hide();
              // Reload the task list
              loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
              loadTasks(completed_url, "#completed_task", "#completed_count")
              loadTasks(overdue_url, "#overdue_task", "#overdue_count")
          },
          error: function(xhr, status, error) {
              console.log('Error updating task: ' + error);
              showAlert('success', 'Error updating Task')
          }
      });
  });

  let allTasks = [];

  function fetchTasks() {
    $.get(`${base_url}/tasks/`, function(data) {
      allTasks = data; // Store the fetched tasks
      console.log(allTasks)
    });
  }
  /**
   * Searches for tasks based on the provided query and updates the task container with the results.
   *
   * This function filters the tasks stored in the `allTasks` array based on the provided query.
   * If the query is an empty string, it clears the task container and fetches all tasks again.
   * Otherwise, it filters the tasks by checking if the query is included in the task's title,
   * description, or category (case-insensitive), and then displays the filtered tasks.
   *
   * @param {string} query - The search query used to filter tasks.
   */
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

  /**
   * Displays a list of tasks in the task container.
   *
   * This function clears the existing content of the task container and appends new task elements
   * based on the provided tasks array. Each task element includes the task's title, description,
   * status, priority, due date, and category. The function also updates the task colors after
   * appending the new elements.
   *
   * @param {Array} tasks - An array of task objects to be displayed.
   */
  function displayTasks(tasks) {
    const container = $('#taskContainer');
    container.empty(); // Clear the container

    tasks.forEach(task => {
      const status = statusMap[task.status] || task.status; // Default to original if no match
      const priority = priorityMap[task.priority] || task.priority;
      const time = date_converter(task.due_date)
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

  $('#loader').hide()
  $('#contentToLoad').show()

});

function date_converter(dueDateStr) {
  // Convert due_date string to Date object (considering it's in UTC)

  const date = new Date(dueDateStr);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[monthIndex];
    return `${day} ${month}`;
}


$(document).on('click', '.edit-task-btn', function(){
  const taskId = $(this).data('id');
  $('.edit-task-btn').click(function() {
    console.log(taskId)
    // Fetch task data and populate the form
    $.get(`${base_url}/tasks/` + taskId, function(data) {
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
            url: `${base_url}/tasks/` + taskId + '/delete/',
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                showAlert('success', 'Task Deleted successfully')
                // Reload the task list
                loadTasks(in_progress_url, "#in_progress_task", "#inprogress_count")
                loadTasks(completed_url, "#completed_task", "#completed_count")
                loadTasks(overdue_url, "#overdue_task", "#overdue_count")
                $('#deleteModal').hide()
            },
            error: function(xhr, status, error) {
                console.log('Error deleting task: ' + error);
                showAlert('success', 'Error deleting Task')
            }
        });
    }
  });
})

/**
 * Updates the colors of task elements based on their status and priority.
 *
 * This function selects all task elements within the '#taskContainer' and iterates through each task.
 * It reads the status and priority text of each task and applies corresponding color classes to the elements.
 * 
 * Status colors:
 * - 'In Progress': Adds the 'text-blue-500' class.
 * - 'Completed': Adds the 'green' class.
 * 
 * Priority colors:
 * - 'High': Adds the 'red' class.
 * - 'Medium': Adds the 'yellow' class.
 * - 'Low': Adds the 'green' class.
 */
function updateTaskColors() {
  const tasks = document.querySelectorAll('#taskContainer > div');
  tasks.forEach(task => {
      const statusText = task.querySelector('.status-text').textContent;
      const priorityText = task.querySelector('.priority-text').textContent;
      // Update status color
      if (statusText === 'In Progress') {
          task.querySelector('.status-text').classList.add('text-blue-500');
      } else if (statusText === 'Completed') {
          task.querySelector('.status-text').classList.add('green');
      }

      // Update priority color
      if (priorityText === 'High') {
          task.querySelector('.priority-text').classList.add('red');
      } else if (priorityText === 'Medium') {
          task.querySelector('.priority-text').classList.add('yellow');
      } else if (priorityText === 'Low') {
          task.querySelector('.priority-text').classList.add('green');
      }

  });
}
/**
 * Filters tasks based on selected priority, due date, and category.
 *
 * This function constructs a URL with query parameters based on the selected filter criteria.
 * It then calls the loadTasks function to fetch and display the filtered tasks for each task status.
 *
 * @function
 */
function filter() {
  const priority = $('#filterPriority').val();
  const dueDate = $('#filterDuedate').val();
  const category = $('#filterCategory').val();

  let url = '/?';

  if (priority) {
      url += `priority=${priority}&`;
  }
  if (dueDate) {
      url += `due_date=${dueDate}&`;
  }
  if (category) {
      url += `category=${category}&`;
  }
  
  if(url != '/?'){
    loadTasks(in_progress_url+url, "#in_progress_task", "#inprogress_count")
    loadTasks(completed_url+url, "#completed_task", "#completed_count")
    loadTasks(overdue_url+url, "#overdue_task", "#overdue_count")
  }
}

/**
 * Sorts tasks based on the selected sorting criteria.
 *
 * This function constructs a URL with a query parameter for sorting based on the selected criteria.
 * It then calls the loadTasks function to fetch and display the sorted tasks for each task status.
 *
 * @function
 */
function sort() {
  const sortBy = $('#sortBy').val();
  let url = '/?';

  if (sortBy) {
    url += `ordering=${sortBy}`;
  }

  if(url != '/?'){
    console.log(in_progress_url+url)
    loadTasks(in_progress_url+url, "#in_progress_task", "#inprogress_count")
    loadTasks(completed_url+url, "#completed_task", "#completed_count")
    loadTasks(overdue_url+url, "#overdue_task", "#overdue_count")
  }
}