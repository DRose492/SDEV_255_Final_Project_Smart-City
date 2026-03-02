// ------------------------------
// TEACHER PAGE ACCESS CONTROL
// ------------------------------
const role = localStorage.getItem("role");
const teacherEmail = localStorage.getItem("email");

// If not a teacher, redirect to login
if (role !== "teacher") {
    window.location.href = "login.html";
}

// ------------------------------
// LOAD COURSES
// ------------------------------
async function loadCourses() {
    const res = await fetch("http://localhost:3000/api/courses");
    const courses = await res.json();

    const container = document.getElementById("courseList");
    container.innerHTML = "";

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";

        card.innerHTML = `
            <h3>${course.title}</h3>
            <p><strong>Subject:</strong> ${course.subject}</p>
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Description:</strong> ${course.description}</p>
            <p><strong>Owner:</strong> ${course.owner}</p>
        `;

        // Only show edit/delete buttons if THIS teacher owns the course
        if (course.owner === teacherEmail) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.onclick = () => openEditForm(course);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteCourse(course._id);

            card.appendChild(editBtn);
            card.appendChild(deleteBtn);
        }

        container.appendChild(card);
    });
}

loadCourses();

// ------------------------------
// CREATE COURSE
// ------------------------------
async function createCourse() {
    const title = document.getElementById("title").value;
    const subject = document.getElementById("subject").value;
    const credits = document.getElementById("credits").value;
    const description = document.getElementById("description").value;

    const res = await fetch("http://localhost:3000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            subject,
            credits,
            description,
            owner: teacherEmail
        })
    });

    const data = await res.json();
    console.log("Created:", data);

    loadCourses();
}

// ------------------------------
// DELETE COURSE (OWNER ONLY)
// ------------------------------
async function deleteCourse(id) {
    const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            owner: teacherEmail
        })
    });

    const data = await res.json();
    console.log("Delete response:", data);

    loadCourses();
}

// ------------------------------
// EDIT COURSE (OWNER ONLY)
// ------------------------------
function openEditForm(course) {
    document.getElementById("editTitle").value = course.title;
    document.getElementById("editSubject").value = course.subject;
    document.getElementById("editCredits").value = course.credits;
    document.getElementById("editDescription").value = course.description;
    document.getElementById("editId").value = course._id;

    document.getElementById("editForm").style.display = "block";
}

async function saveEdit() {
    const id = document.getElementById("editId").value;

    const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: document.getElementById("editTitle").value,
            subject: document.getElementById("editSubject").value,
            credits: document.getElementById("editCredits").value,
            description: document.getElementById("editDescription").value,
            owner: teacherEmail
        })
    });

    const data = await res.json();
    console.log("Edit response:", data);

    document.getElementById("editForm").style.display = "none";
    loadCourses();
}
