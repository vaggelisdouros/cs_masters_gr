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

const studyAreaDropdownHeader = document.getElementById('study-area-dropdown-header');
const studyAreaDropdownText = document.getElementById('study-area-dropdown-text');
const studyAreaCheckboxesContainer = document.getElementById('study-area-checkboxes');

const programsList = document.getElementById('programs-list');
const noResultsMessage = document.getElementById('no-results');
const clearFiltersButton = document.getElementById('clear-filters-button');
const searchResultsMessage = document.getElementById('search-results-message');
const statsIntroMessage = document.getElementById('stats-intro');
const chartsContainer = document.getElementById('charts-container');
const tuitionCaption = document.getElementById('tuitionCaption');
const studyAreaCaption = document.getElementById('studyAreaCaption');

const exportStudyAreaChartButton = document.getElementById('exportStudyAreaChart');
const exportTuitionChartButton = document.getElementById('exportTuitionChart');


let selectedUniversities = [];
let selectedDepartments = [];
let selectedCities = [];
let selectedTuitionRanges = [];
let selectedStudyAreas = [];

let studyAreaChart = null;
let tuitionChart = null;

const tuitionOptions = [
    'δωρεάν',
    '1€ έως 1000€',
    '1001€ έως 2000€',
    '2001€ έως 3000€',
    '3001€ έως 4000€',
    '4001€ έως 5000€',
    '5001€ και πάνω'
];

const studyAreaShortNames = {
    'Πληροφορική': 'Πληροφορική',
    'Πληροφορική (απόφοιτοι άλλων αντικειμένων)': 'Πληροφ. χωρίς πτυχίο',
    'Τεχνητή Νοημοσύνη, Μηχανική Μάθηση και Επιστήμη Δεδομένων': 'Τεχν. Νοημοσύνη',
    'Δίκτυα Υπολογιστών και Τηλεπικοινωνίες': 'Δίκτυα',
    'Ψηφιακός Μετασχηματισμός και Διοίκηση': 'Ψηφ. Μετασχηματισμός',
    'Ασφάλεια Συστημάτων και Δικτύων': 'Ασφάλεια',
    'Εφαρμογές Λογισμικού': 'Λογισμικό',
    'Βιοπληροφορική, Πληροφορική και Υγεία': 'Βιοπληροφορική',
    'Ενεργειακά Συστήματα και Ανανεώσιμες Πηγές Ενέργειας': 'Ενέργεια',
    'Μαθηματική Μοντελοποίηση και Εφαρμογές': 'Μαθηματικά',
    'Επιστήμη και Τεχνολογία Υλικών': 'Επιστ. Υλικών',
    'Ψηφιακές Επιστήμες και Κοινωνία': 'Κοινωνία',
    'Λοιπές Διατμηματικές Επιλογές': 'Λοιπά',
};

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

function updateDropdownText(headerTextElement, selectedValues, placeholder, countPlaceholder) {
    if (selectedValues.length === 0) {
        headerTextElement.textContent = placeholder;
    } else {
        const selectionCount = selectedValues.length;
        const pluralWord = selectionCount === 1 ? 'επιλογή' : 'επιλογές';
        headerTextElement.textContent = `${countPlaceholder} (${selectionCount} ${pluralWord})`;
    }
}

async function fetchAndDisplayStudyAreaChart(programCount) {
    const queryParams = new URLSearchParams();
    selectedUniversities.forEach(uni => queryParams.append('university', uni));
    selectedDepartments.forEach(dep => queryParams.append('department', dep));
    selectedCities.forEach(city => queryParams.append('city', city));
    selectedTuitionRanges.forEach(tuition => queryParams.append('tuition', tuition));
    selectedStudyAreas.forEach(area => queryParams.append('study_area', area));
    
    try {
        const response = await fetch(`/api/stats?${queryParams.toString()}`);
        const statsData = await response.json();
        
        if (studyAreaChart) {
            studyAreaChart.destroy();
        }
        
        const labels = statsData.map(item => studyAreaShortNames[item.study_area] || item.study_area);
        const data = statsData.map(item => item.count);
        const ctx = document.getElementById('studyAreaChart').getContext('2d');
        
        const studyAreaCount = statsData.length;
        updateStudyAreaCaption(programCount, studyAreaCount);

        studyAreaChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Αριθμός Μεταπτυχιακών',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση στατιστικών:', error);
    }
}

function updateStudyAreaCaption(programCount, studyAreaCount) {
    if (programCount === 0) {
        studyAreaCaption.style.display = 'none';
        return;
    }
    const text = `${programCount} μεταπτυχιακά που καλύπτουν ${studyAreaCount} θεματικές περιοχές.`;
    studyAreaCaption.textContent = text;
    studyAreaCaption.style.display = 'block';
    studyAreaCaption.classList.add('chart-caption');
}

function updateTuitionCaption(programCount, averageTuition) {
    if (programCount === 0 || isNaN(averageTuition)) {
        tuitionCaption.style.display = 'none';
        return;
    }
    const roundedAverageTuition = Math.round(averageTuition);
    const text = `${programCount} μεταπτυχιακά με μέσο όρο διδάκτρων ${roundedAverageTuition}€.`;
    tuitionCaption.textContent = text;
    tuitionCaption.style.display = 'block';
    tuitionCaption.classList.add('chart-caption');
}

async function fetchAndDisplayPrograms() {
    const queryParams = new URLSearchParams();
    selectedUniversities.forEach(uni => queryParams.append('university', uni));
    selectedDepartments.forEach(dep => queryParams.append('department', dep));
    selectedCities.forEach(city => queryParams.append('city', city));
    selectedTuitionRanges.forEach(tuition => queryParams.append('tuition', tuition));
    selectedStudyAreas.forEach(area => queryParams.append('study_area', area));
    
    try {
        const response = await fetch(`/api/programs?${queryParams.toString()}`);
        const programs = await response.json();
        
        let totalTuition = 0;
        let programCount = programs.length;

        programs.forEach(program => {
            if (program.tuition !== null) {
                totalTuition += program.tuition;
            }
        });

        const averageTuition = programCount > 0 ? (totalTuition / programCount) : 0;

        if (programs.length === 0) {
            displayPrograms(programs);
            if (studyAreaChart) studyAreaChart.destroy();
            if (tuitionChart) tuitionChart.destroy();
            updateTuitionCaption(0, 0);
            updateStudyAreaCaption(0, 0);
        } else {
            displayPrograms(programs);
            fetchAndDisplayStudyAreaChart(programCount);
            fetchAndDisplayTuitionHistogram();
            updateTuitionCaption(programCount, averageTuition);
        }
    } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση δεδομένων:', error);
        noResultsMessage.style.display = 'block';
        programsList.innerHTML = '';
        searchResultsMessage.style.display = 'none';
        statsIntroMessage.style.display = 'none';
        if (studyAreaChart) studyAreaChart.destroy();
        if (tuitionChart) tuitionChart.destroy();
        chartsContainer.style.display = 'none';
        updateTuitionCaption(0, 0);
        updateStudyAreaCaption(0, 0);
    }
}

async function fetchAndDisplayTuitionHistogram() {
    const queryParams = new URLSearchParams();
    selectedUniversities.forEach(uni => queryParams.append('university', uni));
    selectedDepartments.forEach(dep => queryParams.append('department', dep));
    selectedCities.forEach(city => queryParams.append('city', city));
    selectedTuitionRanges.forEach(tuition => queryParams.append('tuition', tuition));
    selectedStudyAreas.forEach(area => queryParams.append('study_area', area));
    
    try {
        const response = await fetch(`/api/tuition_stats?${queryParams.toString()}`);
        const tuitionStats = await response.json();

        if (tuitionChart) {
            tuitionChart.destroy();
        }
        
        const chartLabels = [
            'δωρεάν',
            '1-1000€',
            '1001-2000€',
            '2001-3000€',
            '3001-4000€',
            '4001-5000€',
            '5001€+'
        ];
        
        const data = chartLabels.map(label => {
            if (label === 'δωρεάν') return tuitionStats['δωρεάν'];
            if (label === '1-1000€') return tuitionStats['1€ έως 1000€'];
            if (label === '1001-2000€') return tuitionStats['1001€ έως 2000€'];
            if (label === '2001-3000€') return tuitionStats['2001€ έως 3000€'];
            if (label === '3001-4000€') return tuitionStats['3001€ έως 4000€'];
            if (label === '4001-5000€') return tuitionStats['4001€ έως 5000€'];
            if (label === '5001€+') return tuitionStats['5001€ και πάνω'];
            return 0;
        });

        const ctx = document.getElementById('tuitionChart').getContext('2d');
        
        const legendLabel = `Αριθμός Μεταπτυχιακών`;

        tuitionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: legendLabel,
                    data: data,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση στατιστικών διδάκτρων:', error);
    }
}

function displayPrograms(programs) {
    programsList.innerHTML = '';
    
    if (programs.length === 0) {
        noResultsMessage.style.display = 'block';
        searchResultsMessage.style.display = 'none';
        statsIntroMessage.style.display = 'none';
        chartsContainer.style.display = 'none';
    } else {
        noResultsMessage.style.display = 'none';

        const count = programs.length;
        const programsWord = count === 1 ? 'πρόγραμμα' : 'προγράμματα';
        searchResultsMessage.textContent = `Βρέθηκαν ${count} μεταπτυχιακά ${programsWord} με τα κριτήρια που επιλέξατε.`;
        searchResultsMessage.style.display = 'block';
        statsIntroMessage.style.display = 'block';
        chartsContainer.style.display = 'flex';

        programs.forEach(program => {
            const li = document.createElement('li');
            li.className = 'program-item';

            const departmentNames = Array.isArray(program.department_name) ? program.department_name.join(' | ') : program.department_name;
            const universityNames = Array.isArray(program.university_name) ? program.university_name.join(' | ') : program.university_name;
            const cities = Array.isArray(program.city) ? program.city.join(' | ') : program.city;
            
            const studyAreas = Array.isArray(program.study_area) ? program.study_area : [];
            let studyAreasHtml = '';
            if (studyAreas.length > 0) {
                studyAreasHtml = studyAreas.map(area => `<span>${area}</span>`).join('<span class="separator"> | </span>');
            } else {
                studyAreasHtml = 'Δεν υπάρχουν.';
            }

            li.innerHTML = `
                <h3>${program.program_name}</h3>
                <p><strong>Τμήμα:</strong> ${departmentNames}</p>
                <p><strong>Πανεπιστήμιο:</strong> ${universityNames}</p>
                <p><strong>Πόλη:</strong> ${cities}</p>
                <p><strong>Δίδακτρα:</strong> ${program.tuition ? program.tuition + '€' : 'Δεν υπάρχουν δίδακτρα.'}</p>
                <p><strong>Θεματική περιοχή:</strong> ${studyAreasHtml}</p>
                <a href="${program.link}" target="_blank">Επίσημη Σελίδα</a>
            `;
            programsList.appendChild(li);
        });

        const backToFiltersLink = document.createElement('div');
        backToFiltersLink.className = 'back-to-filters-link';
        backToFiltersLink.innerHTML = `<a href="#search-filters">Επιστροφή στα φίλτρα αναζήτησης</a>`;
        programsList.appendChild(backToFiltersLink);
    }
}

const exportChartToPdf = (chartId, filename) => {
    const { jsPDF } = globalThis.jspdf;
    
    const canvas = document.getElementById(chartId);
    
    if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width + 40, canvas.height + 40]
        });
        
        pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
        
        pdf.save(filename);
    }
};

if (exportStudyAreaChartButton) {
    exportStudyAreaChartButton.addEventListener('click', () => {
        exportChartToPdf('studyAreaChart', 'metaptyxiaka_ana_antikeimeno.pdf');
    });
}

if (exportTuitionChartButton) {
    exportTuitionChartButton.addEventListener('click', () => {
        exportChartToPdf('tuitionChart', 'metaptyxiaka_basei_didaktron.pdf');
    });
}

function setupDropdownToggle(headerElement, containerElement) {
    headerElement.addEventListener('click', () => {
        containerElement.parentElement.classList.toggle('open');
    });
}

function clearFilters() {
    selectedUniversities = [];
    selectedDepartments = [];
    selectedCities = [];
    selectedTuitionRanges = [];
    selectedStudyAreas = [];

    initialLoad();
}

clearFiltersButton.addEventListener('click', clearFilters);

document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-checkbox').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});

setupDropdownToggle(universityDropdownHeader, universityCheckboxesContainer);
setupDropdownToggle(cityDropdownHeader, cityCheckboxesContainer);
setupDropdownToggle(departmentDropdownHeader, departmentCheckboxesContainer);
setupDropdownToggle(tuitionDropdownHeader, tuitionCheckboxesContainer);
setupDropdownToggle(studyAreaDropdownHeader, studyAreaCheckboxesContainer);

async function initialLoad() {
    try {
        const response = await fetch(`/api/filters_dynamic`);
        const filters = await response.json();
        
        populateCheckboxes(universityCheckboxesContainer, filters.universities, selectedUniversities, 'uni');
        populateCheckboxes(departmentCheckboxesContainer, filters.departments, selectedDepartments, 'dep');
        populateCheckboxes(cityCheckboxesContainer, filters.cities, selectedCities, 'city');
        populateCheckboxes(tuitionCheckboxesContainer, tuitionOptions, selectedTuitionRanges, 'tuition');
        populateCheckboxes(studyAreaCheckboxesContainer, filters.study_areas, selectedStudyAreas, 'study_area');

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

        studyAreaCheckboxesContainer.addEventListener('change', () => {
            selectedStudyAreas = Array.from(studyAreaCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            updateDropdownText(studyAreaDropdownText, selectedStudyAreas, 'Επιλογή Αντικειμένου...', 'Αντικείμενο');
            fetchAndDisplayPrograms();
        });

        updateDropdownText(universityDropdownText, selectedUniversities, 'Επιλογή Πανεπιστημίου...', 'Πανεπιστήμιο');
        updateDropdownText(departmentDropdownText, selectedDepartments, 'Επιλογή Τμήματος...', 'Τμήμα');
        updateDropdownText(cityDropdownText, selectedCities, 'Επιλογή Πόλης...', 'Πόλη');
        updateDropdownText(tuitionDropdownText, selectedTuitionRanges, 'Επιλογή Διδάκτρων...', 'Δίδακτρα');
        updateDropdownText(studyAreaDropdownText, selectedStudyAreas, 'Επιλογή Αντικειμένου...', 'Αντικείμενο');
        
        fetchAndDisplayPrograms();
    } catch (error) {
        console.error('Σφάλμα κατά την αρχική φόρτωση φίλτρων:', error);
    }
}

document.addEventListener('DOMContentLoaded', initialLoad);