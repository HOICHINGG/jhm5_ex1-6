// HKDSE Analyzer JavaScript
class HKDSEAnalyzer {
    constructor() {
        this.data = [];
        this.chart = null;
        this.currentView = 'distribution';
        this.currentChartType = 'bar';
        this.currentDataType = 'number';
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.createChart();
        this.populateTable();
    }

    async loadData() {
        // Since we can't load CSV directly in static environment, we'll embed the data
        const csvData = `No.,Description,Type,Day School Candidates - No.,Day School Candidates - Cumulative total,All Candidates - No.,All Candidates - Cumulative total
1,No. sat ,Number,40666,40666,49026,49026,
2,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 35/34/33",Number,283,283,296,296
3,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 35/34/33",Percentage,0.7%,0.7%,0.6%,0.6%
4,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 32/31/30",Number,643,926,671,967
5,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 32/31/30",Percentage,1.6%,2.3%,1.4%,2.0%
6,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 29/28/27",Number,1253,2179,1306,2273
7,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 29/28/27",Percentage,3.1%,5.4%,2.7%,4.6%
8,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 26/25/24",Number,2138,4317,2256,4529
9,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 26/25/24",Percentage,5.3%,10.6%,4.6%,9.2%
10,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 23/22/21",Number,3648,7965,3801,8330
11,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 23/22/21",Percentage,9.0%,19.6%,7.8%,17.0%
12,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 20/19/18",Number,4887,12852,5109,13439
13,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 20/19/18",Percentage,12.0%,31.6%,10.4%,27.4%
14,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 17/16/15",Number,4011,16863,4187,17626
15,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 17/16/15",Percentage,9.9%,41.5%,8.5%,36.0%
16,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 14/13/12",Number,1164,18027,1224,18850
17,"Candidates achieved (332A)22 or above with total grade points in the best five subjects - 14/13/12",Percentage,2.9%,44.3%,2.5%,38.4%`;

        this.data = this.parseCSV(csvData);
    }

    parseCSV(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }

        return this.processData(data);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    processData(rawData) {
        const processedData = [];
        
        // Group data by grade ranges
        const gradeRanges = {
            '35-33': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '32-30': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '29-27': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '26-24': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '23-21': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '20-18': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '17-15': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 },
            '14-12': { dayNum: 0, dayPct: 0, allNum: 0, allPct: 0, cumDay: 0, cumAll: 0 }
        };

        rawData.forEach(row => {
            const desc = row.Description;
            if (desc.includes('35/34/33')) {
                this.updateGradeRange(gradeRanges['35-33'], row);
            } else if (desc.includes('32/31/30')) {
                this.updateGradeRange(gradeRanges['32-30'], row);
            } else if (desc.includes('29/28/27')) {
                this.updateGradeRange(gradeRanges['29-27'], row);
            } else if (desc.includes('26/25/24')) {
                this.updateGradeRange(gradeRanges['26-24'], row);
            } else if (desc.includes('23/22/21')) {
                this.updateGradeRange(gradeRanges['23-21'], row);
            } else if (desc.includes('20/19/18')) {
                this.updateGradeRange(gradeRanges['20-18'], row);
            } else if (desc.includes('17/16/15')) {
                this.updateGradeRange(gradeRanges['17-15'], row);
            } else if (desc.includes('14/13/12')) {
                this.updateGradeRange(gradeRanges['14-12'], row);
            }
        });

        // Convert to array format
        Object.keys(gradeRanges).forEach(range => {
            processedData.push({
                gradeRange: range,
                ...gradeRanges[range]
            });
        });

        return processedData;
    }

    updateGradeRange(gradeData, row) {
        if (row.Type === 'Number') {
            gradeData.dayNum = parseInt(row['Day School Candidates - No.']) || 0;
            gradeData.allNum = parseInt(row['All Candidates - No.']) || 0;
            gradeData.cumDay = parseInt(row['Day School Candidates - Cumulative total']) || 0;
            gradeData.cumAll = parseInt(row['All Candidates - Cumulative total']) || 0;
        } else if (row.Type === 'Percentage') {
            gradeData.dayPct = parseFloat(row['Day School Candidates - No.'].replace('%', '')) || 0;
            gradeData.allPct = parseFloat(row['All Candidates - No.'].replace('%', '')) || 0;
        }
    }

    setupEventListeners() {
        document.getElementById('viewType').addEventListener('change', (e) => {
            this.currentView = e.target.value;
        });

        document.getElementById('chartType').addEventListener('change', (e) => {
            this.currentChartType = e.target.value;
        });

        document.getElementById('dataType').addEventListener('change', (e) => {
            this.currentDataType = e.target.value;
        });

        document.getElementById('updateChart').addEventListener('click', () => {
            this.createChart();
            this.updateChartTitle();
        });

        document.getElementById('exportPNG').addEventListener('click', () => {
            this.exportChart('png');
        });

        document.getElementById('exportCSV').addEventListener('click', () => {
            this.exportData('csv');
        });

        document.getElementById('exportJSON').addEventListener('click', () => {
            this.exportData('json');
        });
    }

    updateStats() {
        // Get total candidates from first row of raw data
        const totalDay = 40666;
        const totalAll = 49026;
        
        // Calculate top performers (35-33)
        const topPerformers = this.data.find(d => d.gradeRange === '35-33');
        
        // Calculate pass rate (≥20 points)
        const passData = this.data.filter(d => {
            const range = d.gradeRange.split('-');
            return parseInt(range[0]) >= 20;
        });
        const passCount = passData.reduce((sum, d) => sum + d.allNum, 0);
        const passRate = ((passCount / totalAll) * 100).toFixed(1);
        
        // Calculate excellence rate (≥30 points)
        const excellenceData = this.data.filter(d => {
            const range = d.gradeRange.split('-');
            return parseInt(range[0]) >= 30;
        });
        const excellenceCount = excellenceData.reduce((sum, d) => sum + d.allNum, 0);
        const excellenceRate = ((excellenceCount / totalAll) * 100).toFixed(1);

        // Update DOM
        document.getElementById('totalCandidates').textContent = totalAll.toLocaleString();
        document.getElementById('topPerformers').textContent = topPerformers ? topPerformers.allNum.toLocaleString() : '0';
        document.getElementById('passRate').textContent = `${passRate}%`;
        document.getElementById('excellenceRate').textContent = `${excellenceRate}%`;
    }

    createChart() {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = this.getChartData();
        const config = {
            type: this.currentChartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: this.currentChartType !== 'doughnut' ? {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Grade Range'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: this.currentDataType === 'number' ? 'Number of Candidates' : 'Percentage (%)'
                        }
                    }
                } : {}
            }
        };

        this.chart = new Chart(ctx, config);
        this.updateChartTitle();
    }

    getChartData() {
        const labels = this.data.map(d => d.gradeRange);
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
        ];

        let datasets = [];

        if (this.currentView === 'distribution') {
            datasets = [{
                label: this.currentDataType === 'number' ? 'Day School' : 'Day School %',
                data: this.data.map(d => this.currentDataType === 'number' ? d.dayNum : d.dayPct),
                backgroundColor: colors[0],
                borderColor: colors[0],
                borderWidth: 1
            }, {
                label: this.currentDataType === 'number' ? 'All Candidates' : 'All Candidates %',
                data: this.data.map(d => this.currentDataType === 'number' ? d.allNum : d.allPct),
                backgroundColor: colors[1],
                borderColor: colors[1],
                borderWidth: 1
            }];
        } else if (this.currentView === 'cumulative') {
            datasets = [{
                label: 'Day School Cumulative',
                data: this.data.map(d => d.cumDay),
                backgroundColor: colors[2],
                borderColor: colors[2],
                borderWidth: 1
            }, {
                label: 'All Candidates Cumulative',
                data: this.data.map(d => d.cumAll),
                backgroundColor: colors[3],
                borderColor: colors[3],
                borderWidth: 1
            }];
        } else { // comparison
            datasets = [{
                label: 'Difference (All - Day School)',
                data: this.data.map(d => d.allNum - d.dayNum),
                backgroundColor: colors[4],
                borderColor: colors[4],
                borderWidth: 1
            }];
        }

        if (this.currentChartType === 'doughnut') {
            return {
                labels: labels,
                datasets: [{
                    data: this.currentDataType === 'number' ? 
                        this.data.map(d => d.allNum) : 
                        this.data.map(d => d.allPct),
                    backgroundColor: colors,
                    borderWidth: 2
                }]
            };
        }

        return {
            labels: labels,
            datasets: datasets
        };
    }

    updateChartTitle() {
        const titles = {
            'distribution': 'Grade Distribution Analysis',
            'cumulative': 'Cumulative Results Analysis',
            'comparison': 'Day School vs All Candidates Comparison'
        };
        document.getElementById('chartTitle').textContent = titles[this.currentView];
    }

    populateTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        this.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.gradeRange}</strong></td>
                <td class="number">${row.dayNum.toLocaleString()}</td>
                <td class="percentage">${row.dayPct}%</td>
                <td class="number">${row.allNum.toLocaleString()}</td>
                <td class="percentage">${row.allPct}%</td>
                <td class="number">${row.cumAll.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    exportChart(format) {
        if (this.chart && format === 'png') {
            const url = this.chart.toBase64Image();
            const link = document.createElement('a');
            link.download = 'hkdse-chart.png';
            link.href = url;
            link.click();
        }
    }

    exportData(format) {
        if (format === 'csv') {
            const csvContent = this.generateCSV();
            this.downloadFile(csvContent, 'hkdse-data.csv', 'text/csv');
        } else if (format === 'json') {
            const jsonContent = JSON.stringify(this.data, null, 2);
            this.downloadFile(jsonContent, 'hkdse-data.json', 'application/json');
        }
    }

    generateCSV() {
        const headers = ['Grade Range', 'Day School', 'Day School %', 'All Candidates', 'All Candidates %', 'Cumulative All'];
        const rows = this.data.map(row => [
            row.gradeRange,
            row.dayNum,
            row.dayPct + '%',
            row.allNum,
            row.allPct + '%',
            row.cumAll
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HKDSEAnalyzer();
});