function Project(name){
    let projectName = name;
    const todoItems = [];
    const addToProject = (item) => {
        todoItems.push(item);
    }
    return {todoItems, addToProject, projectName};
}

function TodoItem(title, description, deadline, priority, parentProject){
    return {title, description, deadline, priority, parentProject};
}

function AppController(){
    const projects = [];
    const todoItems = [];

    const defaultProject = Project("default");
    projects.push(defaultProject);
   
    const createTodoItem = (title, description, deadline, priority, project) => {
        let item = TodoItem(title, description, deadline, priority, project);
        addToProject(project, item);
        todoItems.push(item);
        return item;
    }

    const deleteTodoItem = (item) => {
        //Remove todoItem from its parent project
        const arr = item.parentProject.todoItems;
        arr.forEach((element, index) => {
            if (element === item){
                arr.splice(index, 1);
            }
        });
        //Remove todoItem from the todoItems array
        todoItems.forEach((element, index) => {
            if (element === item){
                todoItems.splice(index, 1);
            }
        });
    }
    

    const addToProject = (project, item) => {
        project.addToProject(item);
    }

    const createProject = (name) => {
        let project = Project(name);
        projects.push(project);
        return project;
    }

    const getDefaultProject = () => defaultProject;

    return {createTodoItem, createProject, getDefaultProject, projects, todoItems, deleteTodoItem};
}

const app = AppController();
const proj1 = app.createProject("project-1");
const item1 = app.createTodoItem("item-1", "demo for item-1", "2020-04-12", 2, proj1);
console.log(proj1);

console.log("oi");
console.log("hi");
console.log("hello");
console.log("hello");