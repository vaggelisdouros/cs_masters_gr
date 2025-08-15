from flask import Flask, jsonify, request, render_template
import json
import os 

app = Flask(__name__)

# Συνάρτηση για τη φόρτωση των δεδομένων από το JSON αρχείο
def load_data():
    # Δημιουργεί την πλήρη διαδρομή προς το αρχείο data.json
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'data.json')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

programs_data = load_data()

def normalize_text(text):
    if not isinstance(text, str):
        return ''
    
    text = text.lower()
    text = text.replace('ά', 'α')
    text = text.replace('έ', 'ε')
    text = text.replace('ή', 'η')
    text = text.replace('ί', 'ι')
    text = text.replace('ό', 'ο')
    text = text.replace('ύ', 'υ')
    text = text.replace('ώ', 'ω')
    
    return text

def parse_tuition_range(tuition_range_str):
    if tuition_range_str == 'δωρεάν':
        return 0, 0
    elif 'και πάνω' in tuition_range_str:
        clean_value = ''.join(c for c in tuition_range_str if c.isdigit())
        return int(clean_value), float('inf')
    else:
        parts = tuition_range_str.replace('€', '').replace(' ', '').split('έως')
        min_tuition = int(parts[0])
        max_tuition = int(parts[1])
        return min_tuition, max_tuition

@app.route('/api/programs', methods=['GET'])
def get_programs():
    selected_universities = request.args.getlist('university')
    selected_departments = request.args.getlist('department')
    selected_cities = request.args.getlist('city')
    selected_tuition_ranges = request.args.getlist('tuition')
    selected_study_areas = request.args.getlist('study_area')

    filtered_programs = []
    
    for program in programs_data:
        department_matches = not selected_departments or any(dep in program['department_name'] for dep in selected_departments)
        university_matches = not selected_universities or any(uni in program['university_name'] for uni in selected_universities)
        city_matches = not selected_cities or any(city in program['city'] for city in selected_cities)
        
        study_area_matches = True
        if selected_study_areas:
            program_study_areas = program.get('study_area', [])
            study_area_matches = any(area in program_study_areas for area in selected_study_areas)

        tuition_matches = True
        if selected_tuition_ranges:
            tuition_matches = False
            for tuition_range_str in selected_tuition_ranges:
                tuition = program.get('tuition')
                min_t, max_t = parse_tuition_range(tuition_range_str)
                if min_t <= (tuition or 0) <= max_t:
                    tuition_matches = True
                    break

        if department_matches and university_matches and city_matches and tuition_matches and study_area_matches:
            filtered_programs.append(program)
    
    sorted_programs = sorted(filtered_programs, key=lambda p: normalize_text(p['program_name']))
    return jsonify(sorted_programs)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    selected_universities = request.args.getlist('university')
    selected_departments = request.args.getlist('department')
    selected_cities = request.args.getlist('city')
    selected_tuition_ranges = request.args.getlist('tuition')
    selected_study_areas = request.args.getlist('study_area')

    filtered_programs = []
    
    for program in programs_data:
        department_matches = not selected_departments or any(dep in program['department_name'] for dep in selected_departments)
        university_matches = not selected_universities or any(uni in program['university_name'] for uni in selected_universities)
        city_matches = not selected_cities or any(city in program['city'] for city in selected_cities)
        
        tuition_matches = True
        if selected_tuition_ranges:
            tuition_matches = False
            for tuition_range_str in selected_tuition_ranges:
                tuition = program.get('tuition')
                min_t, max_t = parse_tuition_range(tuition_range_str)
                if min_t <= (tuition or 0) <= max_t:
                    tuition_matches = True
                    break

        study_area_matches = True
        if selected_study_areas:
            program_study_areas = program.get('study_area', [])
            study_area_matches = any(area in program_study_areas for area in selected_study_areas)

        if department_matches and university_matches and city_matches and tuition_matches and study_area_matches:
            filtered_programs.append(program)

    study_area_counts = {}
    for program in filtered_programs:
        areas = program.get('study_area', [])
        for area in areas:
            study_area_counts[area] = study_area_counts.get(area, 0) + 1
    
    # Μετατροπή του dictionary σε λίστα αντικειμένων για το Chart.js
    stats_list = [{'study_area': area, 'count': count} for area, count in study_area_counts.items()]
    stats_list.sort(key=lambda x: x['study_area'])
    
    return jsonify(stats_list)

@app.route('/api/tuition_stats', methods=['GET'])
def get_tuition_stats():
    selected_universities = request.args.getlist('university')
    selected_departments = request.args.getlist('department')
    selected_cities = request.args.getlist('city')
    selected_tuition_ranges = request.args.getlist('tuition')
    selected_study_areas = request.args.getlist('study_area')

    filtered_programs = []
    for program in programs_data:
        department_matches = not selected_departments or any(dep in program['department_name'] for dep in selected_departments)
        university_matches = not selected_universities or any(uni in program['university_name'] for uni in selected_universities)
        city_matches = not selected_cities or any(city in program['city'] for city in selected_cities)
        
        study_area_matches = True
        if selected_study_areas:
            program_study_areas = program.get('study_area', [])
            study_area_matches = any(area in program_study_areas for area in selected_study_areas)

        tuition_matches = True
        if selected_tuition_ranges:
            tuition_matches = False
            for tuition_range_str in selected_tuition_ranges:
                tuition = program.get('tuition')
                min_t, max_t = parse_tuition_range(tuition_range_str)
                if min_t <= (tuition or 0) <= max_t:
                    tuition_matches = True
                    break

        if department_matches and university_matches and city_matches and tuition_matches and study_area_matches:
            filtered_programs.append(program)
            
    tuition_options = [
        'δωρεάν',
        '1€ έως 1000€',
        '1001€ έως 2000€',
        '2001€ έως 3000€',
        '3001€ έως 4000€',
        '4001€ έως 5000€',
        '5001€ και πάνω'
    ]
    
    tuition_counts = {option: 0 for option in tuition_options}
    
    for program in filtered_programs:
        tuition = program.get('tuition')
        
        # Διόρθωση: Αν τα δίδακτρα είναι None, θεωρούνται δωρεάν για το γράφημα.
        if tuition is None or tuition == 0:
            tuition_counts['δωρεάν'] += 1
        elif 1 <= tuition <= 1000:
            tuition_counts['1€ έως 1000€'] += 1
        elif 1001 <= tuition <= 2000:
            tuition_counts['1001€ έως 2000€'] += 1
        elif 2001 <= tuition <= 3000:
            tuition_counts['2001€ έως 3000€'] += 1
        elif 3001 <= tuition <= 4000:
            tuition_counts['3001€ έως 4000€'] += 1
        elif 4001 <= tuition <= 5000:
            tuition_counts['4001€ έως 5000€'] += 1
        elif tuition > 5000:
            tuition_counts['5001€ και πάνω'] += 1
            
    return jsonify(tuition_counts)

@app.route('/api/filters_dynamic', methods=['GET'])
def get_dynamic_filters():
    def flatten_and_collect_unique(data, key):
        all_values = set()
        for item in data:
            values = item.get(key)
            if isinstance(values, list):
                for v in values:
                    if v:
                        all_values.add(v)
            elif values:
                all_values.add(values)
        return sorted(list(all_values))

    available_departments = flatten_and_collect_unique(programs_data, 'department_name')
    available_universities = flatten_and_collect_unique(programs_data, 'university_name')
    available_cities = flatten_and_collect_unique(programs_data, 'city')
    available_study_areas = flatten_and_collect_unique(programs_data, 'study_area')
            
    return jsonify({
        'departments': available_departments,
        'universities': available_universities,
        'cities': available_cities,
        'study_areas': available_study_areas
    })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)