const categoryInput = document.getElementById('categoryInput');
const addCategoryButton = document.getElementById('addCategoryButton');
const categoryList = document.getElementById('categoryList');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const categorySelect = document.getElementById('categorySelect');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const analyticsChart = document.getElementById('analyticsChart');
const categoryCompletion = document.getElementById('categoryCompletion');

let categories = JSON.parse(localStorage.getItem('categories')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskIndex = null; // Variable to keep track of the task being edited

// Function to render categories
function renderCategories() {
    categoryList.innerHTML = '';
    categorySelect.innerHTML = '';
    categories.forEach((category, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${category}
            <button onclick="deleteCategory(${index})">Delete</button>
        `;
        categoryList.appendChild(li);

        const option = document.createElement('option');
        option.value = category;
        option.innerText = category;
        categorySelect.appendChild(option);
    });
}

// Function to add category
addCategoryButton.addEventListener('click', () => {
    const category = categoryInput.value.trim();
    if (category) {
        categories.push(category);
        localStorage.setItem('categories', JSON.stringify(categories));
        categoryInput.value = '';
        renderCategories();
        alert('Category added successfully!');
    }
});

// Function to delete category
function deleteCategory(index) {
    categories.splice(index, 1);
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategories();
    alert('Category deleted successfully!');
}

// Function to add task
addTaskButton.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
    
    if (taskName) {
        if (editingTaskIndex !== null) {
            // Update the existing task
            tasks[editingTaskIndex] = { name: taskName, dueDate, categories: selectedCategories, completed: false };
            editingTaskIndex = null; // Reset the editing task index
            addTaskButton.textContent = 'Add Task'; // Reset button text
            alert('Task updated successfully!');
        } else {
            // Add a new task
            tasks.push({ name: taskName, dueDate, categories: selectedCategories, completed: false });
            alert('Task added successfully!');
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
        dueDateInput.value = '';
        renderTasks();
        renderAnalytics();
    } else {
        alert('Task name cannot be empty!');
    }
});

// Function to render tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

        li.style.color = isOverdue ? 'red' : 'black';  // Highlight overdue tasks in red
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            ${task.name} - ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            (${task.categories.join(', ')})
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Function to toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    renderAnalytics();
}

// Function to edit task
function editTask(index) {
    const task = tasks[index];
    taskInput.value = task.name;
    dueDateInput.value = task.dueDate;

    // Reset category selection
    Array.from(categorySelect.options).forEach(option => {
        option.selected = task.categories.includes(option.value);
    });

    editingTaskIndex = index; // Set the index of the task being edited
    addTaskButton.textContent = 'Update Task'; // Change button text to indicate update
}

// Function to delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    renderAnalytics();
    alert('Task deleted successfully!');
}

// Function to render analytics
function renderAnalytics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    const completionRates = categories.map(category => {
        const categoryTasks = tasks.filter(task => task.categories.includes(category));
        const categoryCompleted = categoryTasks.filter(task => task.completed).length;
        return categoryCompleted / (categoryTasks.length || 1);
    });

    const completionPercentage = categories.map((category, index) => {
        return `${category}: ${(completionRates[index] * 100).toFixed(2)}%`;
    }).join('<br>');

    categoryCompletion.innerHTML = completionPercentage;

    // Render the chart after updating analytics
    renderChart();
}

// Function to render the bar chart
function renderChart() {
    const ctx = analyticsChart.getContext('2d');
    const completionRates = categories.map(category => {
        const categoryTasks = tasks.filter(task => task.categories.includes(category));
        const categoryCompleted = categoryTasks.filter(task => task.completed).length;
        return {
            category,
            completed: (categoryCompleted / (categoryTasks.length || 1)) * 100
        };
    });

    const chartData = {
        labels: completionRates.map(data => data.category),
        datasets: [{
            label: 'Completed Tasks (%)',
            data: completionRates.map(data => data.completed),
            backgroundColor: 'green'
        }]
    };

    if (window.myChart) {
        window.myChart.destroy(); // Destroy previous chart instance if it exists
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Initial render
renderCategories();
renderTasks();
renderAnalytics();
