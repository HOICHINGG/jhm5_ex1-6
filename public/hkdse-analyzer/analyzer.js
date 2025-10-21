// HKDSE Personal Analysis Tool JavaScript
class HKDSEPersonalAnalyzer {
    constructor() {
        this.currentStep = 1;
        this.electiveCount = 1;
        this.userData = {
            coreSubjects: {},
            electives: [],
            personalInfo: {}
        };
        
        // Grade to score mapping
        this.gradeToScore = {
            '5**': 7,
            '5*': 6,
            '5': 5,
            '4': 4,
            '3': 3,
            '2': 2,
            '1': 1,
            'U': 0
        };

        // HKDSE 2024 statistics (embedded for now)
        this.statisticsData = this.loadStatisticsData();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStep(1);
    }

    setupEventListeners() {
        // Core subject validation
        document.querySelectorAll('.core-subject').forEach(select => {
            select.addEventListener('change', () => this.validateCoreSubjects());
        });

        // Form validation
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('form-select') || e.target.classList.contains('form-input')) {
                this.saveCurrentStepData();
            }
        });
    }

    loadStatisticsData() {
        // Using the existing CSV data structure, but with additional mock data for personal analysis
        return {
            totalCandidates: 49026,
            gradeDistribution: {
                '5**': { count: 296, percentage: 0.6 },
                '5*': { count: 671, percentage: 1.4 },
                '5': { count: 1306, percentage: 2.7 },
                '4': { count: 2256, percentage: 4.6 },
                '3': { count: 3801, percentage: 7.8 },
                '2': { count: 5109, percentage: 10.4 },
                '1': { count: 4187, percentage: 8.5 },
                'U': { count: 1224, percentage: 2.5 }
            },
            cumulativeData: [
                { gradeRange: '35-33', candidates: 296, cumulative: 296 },
                { gradeRange: '32-30', candidates: 671, cumulative: 967 },
                { gradeRange: '29-27', candidates: 1306, cumulative: 2273 },
                { gradeRange: '26-24', candidates: 2256, cumulative: 4529 },
                { gradeRange: '23-21', candidates: 3801, cumulative: 8330 },
                { gradeRange: '20-18', candidates: 5109, cumulative: 13439 },
                { gradeRange: '17-15', candidates: 4187, cumulative: 17626 },
                { gradeRange: '14-12', candidates: 1224, cumulative: 18850 }
            ]
        };
    }

    validateCoreSubjects() {
        const chinese = document.getElementById('chinese').value;
        const english = document.getElementById('english').value;
        const mathematics = document.getElementById('mathematics').value;
        const csd = document.getElementById('csd').value;

        const allFilled = chinese && english && mathematics && csd;
        
        // Update step navigation
        if (allFilled) {
            this.markStepCompleted(1);
        }

        return allFilled;
    }

    saveCurrentStepData() {
        switch (this.currentStep) {
            case 1:
                this.userData.coreSubjects = {
                    chinese: document.getElementById('chinese').value,
                    english: document.getElementById('english').value,
                    mathematics: document.getElementById('mathematics').value,
                    csd: document.getElementById('csd').value
                };
                break;
                
            case 2:
                this.userData.electives = [];
                document.querySelectorAll('.elective-item').forEach(item => {
                    const subject = item.querySelector('.elective-subject').value;
                    const grade = item.querySelector('.elective-grade').value;
                    if (subject && grade) {
                        this.userData.electives.push({ subject, grade });
                    }
                });
                break;
                
            case 3:
                this.userData.personalInfo = {
                    gender: document.getElementById('gender').value,
                    schoolType: document.getElementById('schoolType').value,
                    targetUniversity: document.getElementById('targetUniversity').value,
                    additionalInfo: document.getElementById('additionalInfo').value
                };
                break;
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });
        
        // Update navigation
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show target step
        document.getElementById(`step${stepNumber}`).classList.add('active');
        document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');
        
        this.currentStep = stepNumber;
        
        // Add animation
        document.getElementById(`step${stepNumber}`).classList.add('fade-in');
        setTimeout(() => {
            document.getElementById(`step${stepNumber}`).classList.remove('fade-in');
        }, 500);
    }

    markStepCompleted(stepNumber) {
        document.querySelector(`[data-step="${stepNumber}"]`).classList.add('completed');
    }

    addElective() {
        this.electiveCount++;
        const container = document.querySelector('.electives-container');
        
        const electiveHtml = `
            <div class="elective-item" id="elective${this.electiveCount}">
                <div class="form-group">
                    <label class="form-label">Elective Subject ${this.electiveCount}</label>
                    <div class="elective-row">
                        <select class="form-select elective-subject">
                            <option value="">Select Subject</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="Economics">Economics</option>
                            <option value="Geography">Geography</option>
                            <option value="History">History</option>
                            <option value="ICT">Information and Communication Technology</option>
                            <option value="Liberal Studies">Liberal Studies</option>
                            <option value="Literature">Literature in English</option>
                            <option value="M1">Mathematics Extended Module 1</option>
                            <option value="M2">Mathematics Extended Module 2</option>
                            <option value="Visual Arts">Visual Arts</option>
                            <option value="Business">Business, Accounting and Financial Studies</option>
                            <option value="Chinese Literature">Chinese Literature</option>
                            <option value="Chinese History">Chinese History</option>
                            <option value="Ethics">Ethics and Religious Studies</option>
                            <option value="Health Management">Health Management and Social Care</option>
                            <option value="Music">Music</option>
                            <option value="PE">Physical Education</option>
                            <option value="Technology">Technology and Living</option>
                            <option value="Tourism">Tourism and Hospitality Studies</option>
                        </select>
                        <select class="form-select elective-grade">
                            <option value="">Grade</option>
                            <option value="5**">5**</option>
                            <option value="5*">5*</option>
                            <option value="5">5</option>
                            <option value="4">4</option>
                            <option value="3">3</option>
                            <option value="2">2</option>
                            <option value="1">1</option>
                            <option value="U">U</option>
                        </select>
                        <button type="button" class="remove-elective" onclick="removeElective(${this.electiveCount})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', electiveHtml);
    }

    removeElective(electiveId) {
        document.getElementById(`elective${electiveId}`).remove();
    }

    calculateResults() {
        this.saveCurrentStepData();
        
        // Calculate scores
        const scores = this.calculateScores();
        const eligibility = this.checkUniversityEligibility();
        const ranking = this.calculateRanking(scores.total);
        const suggestions = this.generateSuggestions();
        
        // Display results
        this.displayScores(scores);
        this.displayEligibility(eligibility);
        this.displayRanking(ranking);
        this.displaySuggestions(suggestions);
        
        this.markStepCompleted(3);
        this.showStep(4);
    }

    calculateScores() {
        const core = this.userData.coreSubjects;
        const electives = this.userData.electives;
        
        // Calculate core score (excluding CSD which is Attained/Not Attained)
        const coreScore = 
            this.gradeToScore[core.chinese] + 
            this.gradeToScore[core.english] + 
            this.gradeToScore[core.mathematics];
        
        // Calculate best elective scores (top 2 for university admission)
        const electiveScores = electives
            .map(e => this.gradeToScore[e.grade] || 0)
            .sort((a, b) => b - a);
        
        const bestElectiveScore = electiveScores.slice(0, 2).reduce((sum, score) => sum + score, 0);
        
        return {
            core: coreScore,
            electives: bestElectiveScore,
            total: coreScore + bestElectiveScore,
            electiveDetails: electives.length > 0 ? electives.slice(0, 2) : []
        };
    }

    checkUniversityEligibility() {
        const core = this.userData.coreSubjects;
        
        const requirements = {
            chinese: { required: 3, actual: this.gradeToScore[core.chinese], met: this.gradeToScore[core.chinese] >= 3 },
            english: { required: 3, actual: this.gradeToScore[core.english], met: this.gradeToScore[core.english] >= 3 },
            mathematics: { required: 2, actual: this.gradeToScore[core.mathematics], met: this.gradeToScore[core.mathematics] >= 2 },
            csd: { required: 'Attained', actual: core.csd, met: core.csd === 'Attained' }
        };
        
        const allMet = Object.values(requirements).every(req => req.met);
        
        return {
            eligible: allMet,
            requirements: requirements
        };
    }

    calculateRanking(totalScore) {
        // Find position in cumulative data
        let rank = this.statisticsData.totalCandidates;
        let percentile = 0;
        
        for (const range of this.statisticsData.cumulativeData) {
            const [minScore] = range.gradeRange.split('-').map(Number);
            if (totalScore >= minScore) {
                rank = range.cumulative;
                percentile = Math.round((1 - rank / this.statisticsData.totalCandidates) * 100);
                break;
            }
        }
        
        return {
            rank: rank,
            percentile: percentile,
            totalCandidates: this.statisticsData.totalCandidates,
            performance: percentile >= 80 ? 'Excellent' : percentile >= 60 ? 'Good' : percentile >= 40 ? 'Average' : 'Below Average'
        };
    }

    generateSuggestions() {
        const core = this.userData.coreSubjects;
        const eligibility = this.checkUniversityEligibility();
        const suggestions = [];
        
        // Check each requirement
        if (!eligibility.requirements.chinese.met) {
            suggestions.push({
                icon: 'fas fa-language',
                title: 'Improve Chinese Language',
                description: `You need at least Grade 3 in Chinese (currently ${core.chinese}). Focus on reading comprehension and writing skills.`
            });
        }
        
        if (!eligibility.requirements.english.met) {
            suggestions.push({
                icon: 'fas fa-globe',
                title: 'Improve English Language',
                description: `You need at least Grade 3 in English (currently ${core.english}). Practice speaking and writing regularly.`
            });
        }
        
        if (!eligibility.requirements.mathematics.met) {
            suggestions.push({
                icon: 'fas fa-calculator',
                title: 'Improve Mathematics',
                description: `You need at least Grade 2 in Mathematics (currently ${core.mathematics}). Review fundamental concepts and practice problem-solving.`
            });
        }
        
        if (!eligibility.requirements.csd.met) {
            suggestions.push({
                icon: 'fas fa-users',
                title: 'Complete CSD Requirements',
                description: 'You must achieve "Attained" in Citizenship and Social Development to meet university admission requirements.'
            });
        }
        
        // Elective suggestions
        if (this.userData.electives.length < 2) {
            suggestions.push({
                icon: 'fas fa-plus-circle',
                title: 'Add More Electives',
                description: 'Consider taking more elective subjects to improve your total score and university options.'
            });
        }
        
        // General improvement suggestions
        if (eligibility.eligible) {
            suggestions.push({
                icon: 'fas fa-trophy',
                title: 'You Meet Basic Requirements!',
                description: 'Great! You meet the basic university admission requirements. Consider improving your elective grades for better programme choices.'
            });
        }
        
        return suggestions;
    }

    displayScores(scores) {
        document.getElementById('totalScore').textContent = scores.total;
        document.getElementById('coreScore').textContent = scores.core;
        document.getElementById('electiveScore').textContent = scores.electives;
        
        const electiveDetail = scores.electiveDetails.length > 0 
            ? scores.electiveDetails.map(e => `${e.subject}: ${e.grade}`).join(', ')
            : 'No electives';
        document.getElementById('electiveDetail').textContent = electiveDetail;
        
        document.getElementById('scoreBreakdown').textContent = `${scores.core} (Core) + ${scores.electives} (Electives)`;
    }

    displayEligibility(eligibility) {
        const indicator = document.getElementById('eligibilityIndicator');
        const breakdown = document.getElementById('requirementsBreakdown');
        
        if (eligibility.eligible) {
            indicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Eligible for University Admission</span>';
            indicator.className = 'eligibility-indicator eligible';
        } else {
            indicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Not Yet Eligible</span>';
            indicator.className = 'eligibility-indicator not-eligible';
        }
        
        // Display requirements breakdown
        const requirementsHtml = Object.entries(eligibility.requirements).map(([subject, req]) => {
            const subjectNames = {
                chinese: 'Chinese Language',
                english: 'English Language', 
                mathematics: 'Mathematics',
                csd: 'CSD'
            };
            
            return `
                <div class="requirement-item ${req.met ? 'met' : 'not-met'}">
                    <div class="requirement-icon ${req.met ? 'met' : 'not-met'}">
                        <i class="fas fa-${req.met ? 'check' : 'times'}"></i>
                    </div>
                    <div class="requirement-text">
                        <div class="requirement-label">${subjectNames[subject]}</div>
                        <div class="requirement-value">Required: ${req.required}, Your: ${req.actual}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        breakdown.innerHTML = requirementsHtml;
    }

    displayRanking(ranking) {
        const container = document.getElementById('rankingDisplay');
        
        container.innerHTML = `
            <div class="ranking-stats">
                <div class="ranking-stat">
                    <div class="ranking-value">${ranking.percentile}%</div>
                    <div class="ranking-label">Percentile</div>
                </div>
                <div class="ranking-stat">
                    <div class="ranking-value">${ranking.rank.toLocaleString()}</div>
                    <div class="ranking-label">Your Rank</div>
                </div>
                <div class="ranking-stat">
                    <div class="ranking-value">${ranking.totalCandidates.toLocaleString()}</div>
                    <div class="ranking-label">Total Candidates</div>
                </div>
                <div class="ranking-stat">
                    <div class="ranking-value">${ranking.performance}</div>
                    <div class="ranking-label">Performance Level</div>
                </div>
            </div>
            <p style="text-align: center; color: var(--text-secondary); margin-top: 1rem;">
                You performed better than ${ranking.percentile}% of all HKDSE candidates in 2024.
            </p>
        `;
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestionsContainer');
        
        if (suggestions.length === 0) {
            container.innerHTML = '<p>Great work! You\'re on track for university admission.</p>';
            return;
        }
        
        const suggestionsHtml = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-icon">
                    <i class="${suggestion.icon}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = suggestionsHtml;
    }

    showWhatIfAnalysis() {
        alert('What-If Analysis feature will be implemented in the next update!');
    }

    exportResults() {
        const results = {
            userData: this.userData,
            scores: this.calculateScores(),
            eligibility: this.checkUniversityEligibility(),
            ranking: this.calculateRanking(this.calculateScores().total),
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hkdse-analysis-results.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    resetForm() {
        this.currentStep = 1;
        this.electiveCount = 1;
        this.userData = {
            coreSubjects: {},
            electives: [],
            personalInfo: {}
        };
        
        // Reset form
        document.querySelectorAll('.form-select, .form-input').forEach(element => {
            element.value = '';
        });
        
        // Reset electives
        document.querySelector('.electives-container').innerHTML = `
            <div class="elective-item" id="elective1">
                <div class="form-group">
                    <label class="form-label">Elective Subject 1</label>
                    <div class="elective-row">
                        <select class="form-select elective-subject">
                            <option value="">Select Subject</option>
                            <!-- Options here -->
                        </select>
                        <select class="form-select elective-grade">
                            <option value="">Grade</option>
                            <!-- Grade options here -->
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Reset navigation
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active', 'completed');
        });
        
        this.showStep(1);
    }
}

// Global functions for onclick handlers
function nextStep() {
    analyzer.saveCurrentStepData();
    
    if (analyzer.currentStep < 4) {
        if (analyzer.currentStep === 1 && !analyzer.validateCoreSubjects()) {
            alert('Please fill in all core subjects before proceeding.');
            return;
        }
        
        analyzer.markStepCompleted(analyzer.currentStep);
        analyzer.showStep(analyzer.currentStep + 1);
    }
}

function prevStep() {
    if (analyzer.currentStep > 1) {
        analyzer.showStep(analyzer.currentStep - 1);
    }
}

function addElective() {
    analyzer.addElective();
}

function removeElective(electiveId) {
    analyzer.removeElective(electiveId);
}

function calculateResults() {
    analyzer.calculateResults();
}

function showWhatIfAnalysis() {
    analyzer.showWhatIfAnalysis();
}

function exportResults() {
    analyzer.exportResults();
}

function resetForm() {
    analyzer.resetForm();
}

// Initialize the analyzer when the page loads
let analyzer;
document.addEventListener('DOMContentLoaded', () => {
    analyzer = new HKDSEPersonalAnalyzer();
});