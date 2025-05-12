document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const downloadHtmlBtn = document.getElementById('download-html');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const portfolioOutput = document.getElementById('portfolio-output');
    const loadingModal = document.getElementById('loading-modal');
    const progressBar = document.getElementById('progress-bar');
    const aiMessage = document.getElementById('ai-message');
    
    // Generate Portfolio
    generateBtn.addEventListener('click', async function() {
        // Get form values
        const name = document.getElementById('name').value.trim();
        const profession = document.getElementById('profession').value.trim();
        const skills = document.getElementById('skills').value.trim();
        const experience = document.getElementById('experience').value.trim();
        const projects = document.getElementById('projects').value.trim();
        const education = document.getElementById('education').value.trim();
        const style = document.getElementById('style').value;
        const color = document.getElementById('color').value;
        const apiKey = document.getElementById('api-key').value.trim();
        
        // Validate required fields
        if (!name || !profession || !skills || !experience || !projects || !education) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Show loading modal
        showLoadingModal();
        
        try {
            // Prepare data for AI
            const userData = {
                name,
                profession,
                skills: skills.split(',').map(skill => skill.trim()),
                experience,
                projects: projects.split(',').map(project => project.trim()),
                education,
                style,
                color
            };
            
            // Generate portfolio content
            updateLoadingProgress(20, "Analyzing your information...");
            const portfolioContent = await generatePortfolioContent(userData, apiKey);
            
            // Generate portfolio design
            updateLoadingProgress(60, "Creating your design...");
            const portfolioHtml = await generatePortfolioDesign(userData, portfolioContent, apiKey);
            
            // Display the generated portfolio
            updateLoadingProgress(90, "Finalizing your portfolio...");
            portfolioOutput.innerHTML = portfolioHtml;
            
            // Enable download buttons
            downloadHtmlBtn.disabled = false;
            downloadPdfBtn.disabled = false;
            
            // Set up download handlers
            downloadHtmlBtn.onclick = () => downloadPortfolio(portfolioHtml, 'html');
            downloadPdfBtn.onclick = () => downloadPortfolio(portfolioHtml, 'pdf');
            
            updateLoadingProgress(100, "Portfolio generated successfully!");
            setTimeout(hideLoadingModal, 1000);
            
        } catch (error) {
            console.error('Error generating portfolio:', error);
            hideLoadingModal();
            alert('Error generating portfolio. Please check your API key and try again.');
        }
    });
    
    // Generate Portfolio Content with AI
    async function generatePortfolioContent(userData, ) {
        // If no API key provided, use mock data
        
        
        const prompt = `Create a professional portfolio content for:
        - Name: ${userData.name}
        - Profession: ${userData.profession}
        - Skills: ${userData.skills.join(', ')}
        - Experience: ${userData.experience} years
        - Projects: ${userData.projects.join(', ')}
        - Education: ${userData.education}
        
        Generate:
        1. A professional headline/tagline
        2. About me section (3 paragraphs)
        3. Skills descriptions (for each skill)
        4. Project descriptions (for each project)
        5. Contact information section
        
        Make it professional and tailored for a ${userData.profession}.
        Use markdown formatting for headings, lists, etc.`;
        
        try {
            const response = await callOpenAI(prompt, apiKey);
            return response;
        } catch (error) {
            console.error('Error calling OpenAI:', error);
            return generateMockContent(userData);
        }
    }
    
    // Generate Portfolio Design with AI
    async function generatePortfolioDesign(userData, content, apiKey) {
        // If no API key provided, use mock design
       
        
        const prompt = `Create a responsive HTML/CSS portfolio webpage with:
        - Color scheme: ${userData.color}
        - Style: ${userData.style}
        - Content: ${content}
        
        Requirements:
        - Modern, clean design
        - Responsive layout
        - Include sections: header, about, skills, projects, contact
        - Use CSS variables for colors
        - Include smooth animations
        - Make it look professional
        
        Output complete HTML code with embedded CSS.`;
        
        try {
            const response = await callOpenAI(prompt, apiKey);
            return response;
        } catch (error) {
            console.error('Error calling OpenAI:', error);
            return generateMockDesign(userData, content);
        }
    }
    
    // Call OpenAI API
    async function callOpenAI(prompt, ) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional web designer and content creator that generates excellent portfolio websites."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });
        
        
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Generate mock content when no API key is provided
    function generateMockContent(userData) {
        return `
# Professional Portfolio for ${userData.name}

## ${userData.profession}

### About Me
I am a passionate ${userData.profession.toLowerCase()} with ${userData.experience} years of experience specializing in ${userData.skills.slice(0, 2).join(' and ')}. My journey in this field began with my education in ${userData.education} and has evolved through various challenging projects.

Throughout my career, I've developed a strong expertise in ${userData.skills.join(', ')}. I thrive in environments that require problem-solving and creative thinking to deliver efficient, user-friendly solutions.

I'm dedicated to continuous learning and staying updated with the latest technologies and best practices in the ${userData.profession.toLowerCase()} field.

### Skills
${userData.skills.map(skill => `- **${skill}**: Experienced in ${skill} with multiple projects implementing this technology`).join('\n')}

### Projects
${userData.projects.map(project => `- **${project}**: Developed a ${project} using ${userData.skills.slice(0, 2).join(' and ')}`).join('\n')}

### Contact
Email: ${userData.name.replace(' ', '.').toLowerCase()}@example.com  
Phone: (555) 123-4567  
Location: San Francisco, CA
        `;
    }
    
    // Generate mock design when no API key is provided
    function generateMockDesign(userData, content) {
        // Convert markdown content to HTML
        const htmlContent = content
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userData.name} | ${userData.profession}</title>
    <style>
        :root {
            --primary-color: ${userData.color};
            --secondary-color: ${shadeColor(userData.color, -20)};
            --dark-color: #2f2e41;
            --light-color: #f8f9fa;
            --white: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background-color: var(--light-color);
            color: var(--dark-color);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            background-color: var(--white);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1rem 0;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        nav ul {
            display: flex;
            list-style: none;
        }
        
        nav ul li {
            margin-left: 1.5rem;
        }
        
        nav ul li a {
            text-decoration: none;
            color: var(--dark-color);
            font-weight: 500;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .hero p {
            font-size: 1.2rem;
            color: var(--dark-color);
            opacity: 0.8;
            max-width: 800px;
            margin: 0 auto;
        }
        
        section {
            padding: 3rem 0;
        }
        
        h2 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .skill-card {
            background-color: var(--white);
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .project-card {
            background-color: var(--white);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .project-image {
            height: 200px;
            background-color: #f0f0f0;
        }
        
        .project-info {
            padding: 1.5rem;
        }
        
        footer {
            background-color: var(--dark-color);
            color: var(--white);
            padding: 2rem 0;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
            }
            
            nav ul {
                margin-top: 1rem;
            }
            
            nav ul li {
                margin: 0 0.5rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container header-content">
            <div class="logo">${userData.name}</div>
            <nav>
                <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#skills">Skills</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>
    
    <main class="container">
        <section class="hero">
            <h1>${userData.name}</h1>
            <p>${userData.profession} specializing in ${userData.skills.slice(0, 3).join(', ')}</p>
        </section>
        
        <section id="about">
            ${htmlContent.split('<h2>About Me</h2>')[1].split('<h2>')[0]}
        </section>
        
        <section id="skills">
            <h2>Skills</h2>
            <div class="skills-grid">
                ${userData.skills.map(skill => `
                <div class="skill-card">
                    <h3>${skill}</h3>
                    <p>Experienced in ${skill} with multiple projects implementing this technology</p>
                </div>
                `).join('')}
            </div>
        </section>
        
        <section id="projects">
            <h2>Projects</h2>
            <div class="projects-grid">
                ${userData.projects.map(project => `
                <div class="project-card">
                    <div class="project-image"></div>
                    <div class="project-info">
                        <h3>${project}</h3>
                        <p>Developed a ${project} using ${userData.skills.slice(0, 2).join(' and ')}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>
        
        <section id="contact">
            <h2>Contact</h2>
            <p>Email: ${userData.name.replace(' ', '.').toLowerCase()}@example.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Location: San Francisco, CA</p>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${userData.name}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
        `;
    }
    
    // Helper function to shade colors
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1,3), 16);
        let G = parseInt(color.substring(3,5), 16);
        let B = parseInt(color.substring(5,7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return "#"+RR+GG+BB;
    }
    
    // Loading modal functions
    function showLoadingModal() {
        loadingModal.style.display = 'flex';
        progressBar.style.width = '0%';
        aiMessage.textContent = 'Starting portfolio generation...';
    }
    
    function updateLoadingProgress(percent, message) {
        progressBar.style.width = `${percent}%`;
        aiMessage.textContent = message;
    }
    
    function hideLoadingModal() {
        loadingModal.style.display = 'none';
    }
    
    // Download portfolio
    function downloadPortfolio(content, format) {
        if (format === 'html') {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'portfolio.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            alert('PDF generation would require a library like jsPDF or browser print functionality.');
            // In a real implementation, you would use jsPDF or window.print()
        }
    }
});