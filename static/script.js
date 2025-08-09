const universityDropdownHeader = document.getElementById('university-dropdown-header');
const universityDropdownText = document.getElementById('university-dropdown-text');
const universityCheckboxesContainer = document.getElementById('university-checkboxes');

const cityDropdownHeader = document.getElementById('city-dropdown-header');
const cityDropdownText = document.getElementById('city-dropdown-text');
const cityCheckboxesContainer = document.getElementById('city-checkboxes');

const departmentDropdownHeader = document.getElementById('department-dropdown-header');
const departmentDropdownText = document.getElementById('department-dropdown-text');
const departmentCheckboxesContainer = document.getElementById('department-checkboxes');

const tuitionDropdownHeader = document.getElementById('tuition-dropdown-header');
const tuitionDropdownText = document.getElementById('tuition-dropdown-text');
const tuitionCheckboxesContainer = document.getElementById('tuition-checkboxes');

const programsList = document.getElementById('programs-list');
const noResultsMessage = document.getElementById('no-results');
const clearFiltersButton = document.getElementById('clear-filters-button');

let selectedUniversities = [];
let selectedDepartments = [];
let selectedCities = [];
let selectedTuitionRanges = [];

const tuitionOptions = [
    'δωρεάν',
    '1€ έως 1000€',
    '1001€ έως 2000€',
    '2001€ έως 3000€',
    '3001€ έως 4000€',
    '4001€ έως 5000€',
    '5001€ και πάνω'
];

// Helper function to populate checkboxes and maintain state
function populateCheckboxes(container, options, selectedValues, idPrefix) {
    container.innerHTML = '';
    options.forEach(option => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${idPrefix}-${option}`;
        checkbox.value = option;
        if (selectedValues.includes(option)) {
            checkbox.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = `${idPrefix}-${option}`;
        label.textContent = option;
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });
}

// ... (υπόλοιπος κώδικας) ...

// Helper function to update dropdown header text
function updateDropdownText(headerTextElement, selectedValues, placeholder, countPlaceholder) {
    if (selectedValues.length === 0) {
        headerTextElement.textContent = placeholder;
    } else {
        const selectionCount = selectedValues.length;
        const pluralWord = selectionCount === 1 ? 'επιλογή' : 'επιλογές';
        headerTextElement.textContent = `${countPlaceholder} (${selectionCount} ${pluralWord})`;
    }
}

// ... (υπόλοιπος κώδικας) ...

// Function to fetch programs and update the list based on ALL selections
async function fetchAndDisplayPrograms() {
    const queryParams = new URLSearchParams();
    selectedUniversities.forEach(uni => queryParams.append('university', uni));
    selectedDepartments.forEach(dep => queryParams.append('department', dep));
    selectedCities.forEach(city => queryParams.append('city', city));
    selectedTuitionRanges.forEach(tuition => queryParams.append('tuition', tuition));
    
    try {
        const response = await fetch(`/api/programs?${queryParams.toString()}`);
        const programs = await response.json();
        displayPrograms(programs);
    } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση δεδομένων:', error);
        noResultsMessage.style.display = 'block';
        programsList.innerHTML = '';
    }
}

// Function to display program results
function displayPrograms(programs) {
    programsList.innerHTML = '';
    
    if (programs.length === 0) {
        noResultsMessage.style.display = 'block';
    } else {
        noResultsMessage.style.display = 'none';
        programs.forEach(program => {
            const li = document.createElement('li');
            li.className = 'program-item';

            // New logic to handle lists and join them with ", "
            const departmentNames = Array.isArray(program.department_name) ? program.department_name.join(', ') : program.department_name;
            const universityNames = Array.isArray(program.university_name) ? program.university_name.join(', ') : program.university_name;
            const cities = Array.isArray(program.city) ? program.city.join(', ') : program.city;

            li.innerHTML = `
                <h3>${program.program_name}</h3>
                <p><strong>Τμήμα:</strong> ${departmentNames}</p>
                <p><strong>Πανεπιστήμιο:</strong> ${universityNames}</p>
                <p><strong>Πόλη:</strong> ${cities}</p>
                <p><strong>Δίδακτρα:</strong> ${program.tuition ? program.tuition + '€' : 'Δεν υπάρχουν δίδακτρα.'}</p>
                <a href="${program.link}" target="_blank">Επίσημη Σελίδα</a>
            `;
            programsList.appendChild(li);
        });
    }
}

// Logic for opening/closing dropdowns
function setupDropdownToggle(headerElement, containerElement) {
    headerElement.addEventListener('click', () => {
        containerElement.parentElement.classList.toggle('open');
    });
}

// Function to reset all filters
function clearFilters() {
    selectedUniversities = [];
    selectedDepartments = [];
    selectedCities = [];
    selectedTuitionRanges = [];

    // Re-populate all dropdowns to reflect the cleared state
    initialLoad();
}

// Event listeners that update state and fetch new programs
universityCheckboxesContainer.addEventListener('change', () => {
    selectedUniversities = Array.from(universityCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
    updateDropdownText(universityDropdownText, selectedUniversities, 'Επιλογή Πανεπιστημίου...', 'Πανεπιστήμιο');
    fetchAndDisplayPrograms();
});

cityCheckboxesContainer.addEventListener('change', () => {
    selectedCities = Array.from(cityCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
    updateDropdownText(cityDropdownText, selectedCities, 'Επιλογή Πόλης...', 'Πόλη');
    fetchAndDisplayPrograms();
});

departmentCheckboxesContainer.addEventListener('change', () => {
    selectedDepartments = Array.from(departmentCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
    updateDropdownText(departmentDropdownText, selectedDepartments, 'Επιλογή Τμήματος...', 'Τμήμα');
    fetchAndDisplayPrograms();
});

tuitionCheckboxesContainer.addEventListener('change', () => {
    selectedTuitionRanges = Array.from(tuitionCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
    updateDropdownText(tuitionDropdownText, selectedTuitionRanges, 'Επιλογή Διδάκτρων...', 'Δίδακτρα');
    fetchAndDisplayPrograms();
});

// Listener for the clear filters button
clearFiltersButton.addEventListener('click', clearFilters);

// Close dropdowns when clicking elsewhere
document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-checkbox').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});

// Setup dropdown toggles
setupDropdownToggle(universityDropdownHeader, universityCheckboxesContainer);
setupDropdownToggle(cityDropdownHeader, cityCheckboxesContainer);
setupDropdownToggle(departmentDropdownHeader, departmentCheckboxesContainer);
setupDropdownToggle(tuitionDropdownHeader, tuitionCheckboxesContainer);

// Initial load
async function initialLoad() {
    try {
        const response = await fetch(`/api/filters_dynamic`);
        const filters = await response.json();
        
        // Populate all checkboxes with the initial, unfiltered lists
        populateCheckboxes(universityCheckboxesContainer, filters.universities, selectedUniversities, 'uni');
        populateCheckboxes(departmentCheckboxesContainer, filters.departments, selectedDepartments, 'dep');
        populateCheckboxes(cityCheckboxesContainer, filters.cities, selectedCities, 'city');
        populateCheckboxes(tuitionCheckboxesContainer, tuitionOptions, selectedTuitionRanges, 'tuition');
        
        updateDropdownText(universityDropdownText, selectedUniversities, 'Επιλογή Πανεπιστημίου...', 'Πανεπιστήμιο');
        updateDropdownText(departmentDropdownText, selectedDepartments, 'Επιλογή Τμήματος...', 'Τμήμα');
        updateDropdownText(cityDropdownText, selectedCities, 'Επιλογή Πόλης...', 'Πόλη');
        updateDropdownText(tuitionDropdownText, selectedTuitionRanges, 'Επιλογή Διδάκτρων...', 'Δίδακτρα');
        
        fetchAndDisplayPrograms();
    } catch (error) {
        console.error('Σφάλμα κατά την αρχική φόρτωση φίλτρων:', error);
    }
}

initialLoad();