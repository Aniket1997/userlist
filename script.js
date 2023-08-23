document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('dataForm');
    const tableBody = document.querySelector('#dataTable tbody');

    async function fetchData() {
        const response = await fetch('http://localhost:3000/data');
        const data = await response.json();
        data.forEach(entry => {
            entry.dateOfBirth = new Date(entry.dateOfBirth);
        });
    
        return data;
    }
    

    async function renderData() {
        const data = await fetchData();
    
        // Sort the data based on age
        data.sort((a, b) => a.age - b.age);
    
        tableBody.innerHTML = '';
        data.forEach(entry => {
            const dobFormatted = entry.dateOfBirth.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
    
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${entry.name}</td>
                <td>${dobFormatted}</td>
                <td style="text-align: center">${entry.age}</td>
                <td class="action-buttons">
                    <button class="edit-button" data-id="${entry.id}">Edit</button>
                    <button class="delete-button" data-id="${entry.id}">Delete</button>
                </td>`;
            tableBody.appendChild(newRow);
        });
    }
    
    
    async function updateData(id, name, dateOfBirth, age) {
        const response = await fetch(`http://localhost:3000/data/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, dateOfBirth, age }) // Include the newAge value
        });
        return response.ok;
    }
    

    async function deleteData(id) {
        const response = await fetch(`http://localhost:3000/data/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    }

    async function handleEditClick(row) {
        const id = row.querySelector('.edit-button').dataset.id;
        const nameCell = row.querySelector('td:nth-child(1)');
        const dobCell = row.querySelector('td:nth-child(2)');
        const ageCell = row.querySelector('td:nth-child(3)');
        const actionCell = row.querySelector('.action-buttons');
    
        const name = nameCell.textContent;
        const dob = dobCell.textContent; // Get the original date of birth as text
        const age = ageCell.textContent;
    
        nameCell.innerHTML = `<input type="text" class="edit-name" value="${name}" style="width: 180px;" />`;
        dobCell.innerHTML = `<input type="date" class="edit-dob" value="${dob}" style="width: 98%;
        border-radius: 6px;
        height: 41px;
        border: 1px solid #c5c5c5;" />`; // Set the width here
        ageCell.innerHTML = `<span class="edit-age">${age}</span>`; // Display the age as a span
        row.querySelector('.edit-button').textContent = 'Save';
    
        actionCell.classList.add('expanded-cell'); // Increase cell width during editing
    }
    
    async function handleSaveClick(row) {
        const id = row.querySelector('.edit-button').dataset.id;
        const newName = row.querySelector('.edit-name').value;
        const newDobInput = row.querySelector('.edit-dob');
        const newDob = newDobInput.value; // Get the value from the input
        const newAge = calculateAge(newDob);
    
        const success = await updateData(id, newName, newDob, newAge);
    
        if (success) {
            await renderData();
        }
    
        row.querySelector('.delete-button').style.display = 'block';
        const actionCell = row.querySelector('.action-buttons');
        actionCell.classList.remove('expanded-cell');
    }
    
    function calculateAge(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
        return age;
    }

    async function handleDeleteClick(id) {
        const success = await deleteData(id);

        if (success) {
            renderData();
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const nameInput = document.getElementById('name');
        const dateOfBirthInput = document.getElementById('dateOfBirth');
        const ageInput = document.getElementById('age');
    
        const name = nameInput.value;
        const dateOfBirth = dateOfBirthInput.value; // Get the value of the dateOfBirth input
        const age = ageInput.value;
    
        if (name && age) {
            const response = await fetch('http://localhost:3000/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, dateOfBirth, age }) // Use the dateOfBirth value
            });
    
            if (response.ok) {
                await renderData(); // Refresh the table after adding new data
    
                nameInput.value = '';
                ageInput.value = '';
            }
        }
    });
    

    tableBody.addEventListener('click', async function (e) {
        if (e.target.classList.contains('edit-button')) {
            const row = e.target.closest('tr');
            if (e.target.textContent === 'Edit') {
                handleEditClick(row);
            } else if (e.target.textContent === 'Save') {
                handleSaveClick(row);
            }
        } else if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            handleDeleteClick(id);
        }
    });

    const dateOfBirthInput = document.getElementById('dateOfBirth');
    const ageInput = document.getElementById('age');

    dateOfBirthInput.addEventListener('change', () => {
        const dob = new Date(dateOfBirthInput.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
        ageInput.value = age;
    });


    await renderData();
});