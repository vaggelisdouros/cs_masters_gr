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

# ... (υπόλοιπος κώδικας) ...

def parse_tuition_range(tuition_range_str):
    if tuition_range_str == 'δωρεάν':
        return 0, 0
    elif 'και πάνω' in tuition_range_str:
        # Αφαιρούμε το σύμβολο του ευρώ και ό,τι άλλο δεν είναι ψηφίο
        clean_value = ''.join(c for c in tuition_range_str if c.isdigit())
        min_tuition = int(clean_value)
        return min_tuition, float('inf')
    else:
        # Αφαιρούμε το σύμβολο του ευρώ και ό,τι άλλο δεν είναι ψηφίο
        # πριν κάνουμε το split
        cleaned_parts = [
            ''.join(c for c in part if c.isdigit())
            for part in tuition_range_str.split(' έως ')
        ]
        min_tuition = int(cleaned_parts[0])
        max_tuition = int(cleaned_parts[1])
        return min_tuition, max_tuition

# ... (υπόλοιπος κώδικας) ...

@app.route('/api/programs', methods=['GET'])
def get_programs():
    departments_filter = request.args.getlist('department')
    universities_filter = request.args.getlist('university')
    cities_filter = request.args.getlist('city')
    tuition_filter = request.args.getlist('tuition')
    
    normalized_departments_filter = [normalize_text(d) for d in departments_filter]
    normalized_universities_filter = [normalize_text(u) for u in universities_filter]
    normalized_cities_filter = [normalize_text(c) for c in cities_filter]
    
    filtered_programs = []

    for program in programs_data:
        tuition = program.get('tuition', 0)
        
        # Helper function to check if any of the selected filters match the program's values
        def matches_any(program_values, filter_values):
            if not filter_values:
                return True
            
            # Ensure program_values is always a list
            if not isinstance(program_values, list):
                program_values = [program_values]
            
            normalized_program_values = [normalize_text(v) for v in program_values if v]
            
            for f_value in filter_values:
                if normalize_text(f_value) in normalized_program_values:
                    return True
            return False

        department_matches = matches_any(program.get('department_name', []), normalized_departments_filter)
        university_matches = matches_any(program.get('university_name', []), normalized_universities_filter)
        city_matches = matches_any(program.get('city', []), normalized_cities_filter)
        
        tuition_matches = False
        if not tuition_filter:
            tuition_matches = True
        else:
            for tuition_range_str in tuition_filter:
                min_t, max_t = parse_tuition_range(tuition_range_str)
                if min_t <= (tuition or 0) <= max_t:
                    tuition_matches = True
                    break

        if department_matches and university_matches and city_matches and tuition_matches:
            filtered_programs.append(program)
    
    sorted_programs = sorted(filtered_programs, key=lambda p: p['program_name'])
    return jsonify(sorted_programs)

@app.route('/api/filters_dynamic', methods=['GET'])
def get_dynamic_filters():
    # Helper function to flatten and collect unique values from a list of lists
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
            
    return jsonify({
        'departments': available_departments,
        'universities': available_universities,
        'cities': available_cities
    })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)