function Project(name){
    let name = name;
    const todoItems = [];
    const addToProject = (item) => {
        todoItems.push(item);
    }
    const getProjectName = () => name;
}

function TodoItem(title, description, deadline, priority, project){
    let title = title;
    let description = description;
    let deadline = deadline;
    let priority = priority;
    let project = project;
    return {title, description, deadline, priority, project};
}


function AppController(){
    const projects = [];
    const todoItems = [];



   
    const createTodoItem = (title, description, deadline, priority, project){
        let item = TodoItem(title, description, deadline, priority, project);
        
    }


}

let app = AppController();
app.createTodoItem('hi', 'not a big deal', 24-12-2004, 2, "default");
