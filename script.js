document.addEventListener('DOMContentLoaded', () => {
  // 1. LOADING SCREEN
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 300);
    }
    loaderProgress.style.width = `${progress}%`;
  }, 100);

  // Helper: Debounce function for performance optimization
  function debounce(func, wait = 15) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 2. NAVBAR SCROLL & ACTIVE LINK OBSERVER
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 10));

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('active');
    });
  });

  const sectionObserverOptions = {
    root: null,
    threshold: 0.3,
    rootMargin: '-50px 0px -50px 0px'
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // 3. THREE.JS HERO SCENE
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && window.THREE) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles Network
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
      originalPositions.push({ x, y, z, seed: Math.random() * 100 });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc41e3a,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Particle Connections lines
    const maxDistance = 9;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3a5a8c,
      transparent: true,
      opacity: 0.12
    });

    let lineSegments = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    scene.add(lineSegments);

    function updateConnections() {
      const coords = particles.geometry.attributes.position.array;
      const linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        const x1 = coords[i * 3];
        const y1 = coords[i * 3 + 1];
        const z1 = coords[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const x2 = coords[j * 3];
          const y2 = coords[j * 3 + 1];
          const z2 = coords[j * 3 + 2];

          const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
          if (dist < maxDistance) {
            linePositions.push(x1, y1, z1, x2, y2, z2);
          }
        }
      }

      lineSegments.geometry.dispose();
      lineSegments.geometry = new THREE.BufferGeometry();
      lineSegments.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    }

    // Floating Geometries (Procedural Shapes)
    const shapes = [];
    const geometries = [
      new THREE.IcosahedronGeometry(2, 1),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1.8, 1),
      new THREE.TorusGeometry(2, 0.4, 8, 24)
    ];
    
    const colors = [0xc41e3a, 0x3a5a8c, 0xd4a017];

    for (let i = 0; i < 7; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.2
      });
      const mesh = new THREE.Mesh(geom, wireframeMat);
      
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      shapes.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: 0.2 + Math.random() * 0.5,
        floatOffset: Math.random() * 100
      });
      
      scene.add(mesh);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Mouse Parallax movement
    // Mouse Parallax & Click explosion logic
    let mouseX = 0, mouseY = 0;
    let explosionStrength = 0;
    const explosionDecay = 0.94;

    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    document.addEventListener('mousedown', () => {
      explosionStrength = 1.8; // Trigger wave push
    });

    let frameCount = 0;
    function animateHero() {
      if (document.visibilityState === 'hidden') {
        requestAnimationFrame(animateHero);
        return;
      }

      frameCount++;
      const time = Date.now() * 0.0005;

      // Animate particles
      const posArray = particles.geometry.attributes.position.array;
      explosionStrength *= explosionDecay;
      if (explosionStrength < 0.01) explosionStrength = 0;

      for (let i = 0; i < particleCount; i++) {
        const orig = originalPositions[i];
        let targetX = orig.x + Math.sin(time + orig.seed) * 1.5;
        let targetY = orig.y + Math.cos(time + orig.seed) * 1.5;
        let targetZ = orig.z + Math.sin(time * 0.5 + orig.seed) * 1.5;

        if (explosionStrength > 0) {
          const pushDir = Math.sin(orig.seed * 50) > 0 ? 1 : -1;
          const factor = 1.0 + (explosionStrength * pushDir * Math.sin(orig.seed + time));
          targetX *= factor;
          targetY *= factor;
          targetZ *= factor;
        }

        posArray[i * 3] = targetX;
        posArray[i * 3 + 1] = targetY;
        posArray[i * 3 + 2] = targetZ;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Connections calculation (staggered for optimization)
      if (frameCount % 4 === 0) {
        updateConnections();
      }

      // Rotate and float shapes
      shapes.forEach(shape => {
        shape.mesh.rotation.x += shape.rotSpeedX;
        shape.mesh.rotation.y += shape.rotSpeedY;
        shape.mesh.position.y += Math.sin(time * shape.floatSpeed + shape.floatOffset) * 0.02;
      });

      // Smooth camera parallax
      const targetCamX = mouseX * 15;
      const targetCamY = -mouseY * 15;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animateHero);
    }

    animateHero();

    window.addEventListener('resize', debounce(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 100));
  }

  // 4. TYPING EFFECT
  const typingText = document.querySelector('.typing-text');
  if (typingText) {
    const roles = [
      'AI & Machine Learning Developer',
      'Full Stack Developer',
      'Data Analytics Expert',
      'Software Engineer',
      'MCA Candidate'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 400; // Pause before next word
      }

      setTimeout(type, typeSpeed);
    }
    setTimeout(type, 1000);
  }

  // 5. GSAP SCROLL TRIGGERS & REVEAL ANIMATIONS
  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Fade-in reveal items
    const revealItems = document.querySelectorAll('.reveal');
    revealItems.forEach((item) => {
      gsap.fromTo(item, 
        { opacity: 0, y: 35 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Education timeline animation
    gsap.fromTo('.timeline-item', 
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.3,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 80%'
        }
      }
    );

    // Skill Category Grid stagger
    gsap.fromTo('.skill-category',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.skills-grid',
          start: 'top 85%'
        }
      }
    );

    // Project holographic cards zoom-in
    gsap.fromTo('.project-card',
      { opacity: 0, scale: 0.95, y: 50 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 80%'
        }
      }
    );

    // Achievement cards stagger
    gsap.fromTo('.achievement-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.achievements-grid',
          start: 'top 85%'
        }
      }
    );
  } else {
    // Scroll reveal fallback when GSAP is not available
    const fallbackObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => fallbackObserver.observe(el));
    document.querySelectorAll('.timeline-item').forEach(el => fallbackObserver.observe(el));
  }

  // 6. SKILLS CANVAS (3D Skill Sphere)
  const skillsCanvas = document.getElementById('skills-canvas');
  if (skillsCanvas && window.THREE) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, skillsCanvas.clientWidth / skillsCanvas.clientHeight, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      canvas: skillsCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(skillsCanvas.clientWidth, skillsCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Distribution points using Fibonacci Lattice on a sphere
    const pointCount = 50;
    const radius = 6.5;
    const nodes = [];

    const categories = [
      { color: 0xc41e3a, name: 'languages' },
      { color: 0x3a5a8c, name: 'aiml' },
      { color: 0xd4a017, name: 'frameworks' },
      { color: 0xc41e3a, name: 'databases' },
      { color: 0x3a5a8c, name: 'webtech' },
      { color: 0xd4a017, name: 'tools' }
    ];

    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / pointCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const nodeGeom = new THREE.SphereGeometry(0.18, 8, 8);
      const nodeCol = categories[i % categories.length].color;
      const nodeMat = new THREE.MeshBasicMaterial({ color: nodeCol });
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(x, y, z);
      sphereGroup.add(node);
      nodes.push(node);
    }

    // Connect nodes with web lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3a5a8c,
      transparent: true,
      opacity: 0.15
    });

    const webPositions = [];
    for (let i = 0; i < pointCount; i++) {
      const p1 = nodes[i].position;
      // Connect to 3 nearest points
      let distances = [];
      for (let j = 0; j < pointCount; j++) {
        if (i === j) continue;
        const p2 = nodes[j].position;
        const dist = p1.distanceTo(p2);
        distances.push({ index: j, dist });
      }
      distances.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < 3; k++) {
        const p2 = nodes[distances[k].index].position;
        webPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    const webGeometry = new THREE.BufferGeometry();
    webGeometry.setAttribute('position', new THREE.Float32BufferAttribute(webPositions, 3));
    const webLines = new THREE.LineSegments(webGeometry, lineMat);
    sphereGroup.add(webLines);

    // Handle mouse rotation influence
    let mouseX = 0, mouseY = 0;
    let isHovered = false;

    skillsCanvas.addEventListener('mousemove', (e) => {
      const rect = skillsCanvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / skillsCanvas.clientWidth) - 0.5;
      mouseY = ((e.clientY - rect.top) / skillsCanvas.clientHeight) - 0.5;
      isHovered = true;
    });

    skillsCanvas.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    // Intersection observer to pause rendering when out of viewport
    let isCanvasVisible = false;
    const observer = new IntersectionObserver((entries) => {
      isCanvasVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(skillsCanvas);

    function animateSkills() {
      if (!isCanvasVisible || document.visibilityState === 'hidden') {
        requestAnimationFrame(animateSkills);
        return;
      }

      if (isHovered) {
        sphereGroup.rotation.y += (mouseX * 0.05 - sphereGroup.rotation.y) * 0.1;
        sphereGroup.rotation.x += (mouseY * 0.05 - sphereGroup.rotation.x) * 0.1;
      } else {
        sphereGroup.rotation.y += 0.003;
        sphereGroup.rotation.x += 0.001;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animateSkills);
    }
    animateSkills();

    window.addEventListener('resize', debounce(() => {
      const width = skillsCanvas.clientWidth;
      const height = skillsCanvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }, 100));
  }

  // 7. CARD TILT EFFECT (HOLOGRAPHIC PARALLAX TILT FOR ALL CARDS)
  const cards = document.querySelectorAll('.project-card, .skill-category, .education-card, .achievement-card, .exp-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xc = rect.width / 2;
      const yc = rect.height / 2;

      const angleX = (yc - y) / 12; // Tilt vertical
      const angleY = (x - xc) / 20; // Tilt horizontal

      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-8px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    });
  });

  // 8. ACHIEVEMENT COUNTERS ANIMATION
  const counterElements = document.querySelectorAll('.achievement-value');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countVal = target.getAttribute('data-count');
        if (countVal && !target.classList.contains('counted')) {
          target.classList.add('counted');
          const maxNum = parseInt(countVal, 10);
          let currentNum = 0;
          const speed = Math.ceil(maxNum / 50); // duration ~1-2 seconds
          
          const counterInterval = setInterval(() => {
            currentNum += speed;
            if (currentNum >= maxNum) {
              currentNum = maxNum;
              clearInterval(counterInterval);
            }
            target.textContent = `${currentNum}+`;
          }, 30);
        } else if (!countVal) {
          // If text based achievement, just keep as is
          target.textContent = target.textContent;
        }
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => countObserver.observe(el));

  // 9. CHATBOT ("Nandhu AI")
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');

  const chatbotKnowledge = {
    greetings: ['hello', 'hi', 'hey', 'greetings', 'namaste', 'morning', 'evening'],
    skills: ['skill', 'technology', 'tech stack', 'programming', 'languages', 'databases', 'know'],
    projects: ['project', 'work', 'portfolio', 'built', 'developed', 'project details'],
    education: ['education', 'study', 'university', 'degree', 'college', 'mca', 'bsc', 'cgpa'],
    experience: ['experience', 'internship', 'work experience', 'job', 'intern', 'teamware'],
    contact: ['contact', 'email', 'phone', 'reach', 'hire', 'phone number', 'linkedin'],
    resume: ['resume', 'cv', 'download'],
    achievements: ['achievement', 'leetcode', 'hackathon', 'award', 'problems'],
    about: ['about', 'who', 'tell me about', 'yourself', 'nandhu', 'profile'],
    liferush: ['liferush', 'blood', 'donation', 'donor'],
    twitter: ['twitter', 'sentiment', 'tweet'],
    studentallotment: ['student allotment', 'seat allotment', 'allotment', 'admission'],
    pdf2audio: ['pdf2audio', 'pdf to audio', 'pdf to speech', 'audio converter']
  };

  const botResponses = {
    greetings: "Hello there! I'm **Nandhu AI**, your assistant here to help. You can ask me about Nandhu's **projects**, **skills**, **education**, **experience**, or how to **contact** him. What would you like to know?",
    
    about: "Nandhu S is an enthusiastic **MCA Candidate** specializing in **Artificial Intelligence, Machine Learning, Data Analytics, and Software Development**. He is passionate about building intelligent platforms, AI-powered applications, and decision-support systems.",
    
    skills: "Here is a quick summary of Nandhu's skills:<br><br>" +
            "• **Languages**: Python, Java, SQL, COBOL, C<br>" +
            "• **AI/ML**: Machine Learning, Deep Learning, NLP, Feature Engineering, Predictive Analytics<br>" +
            "• **Frameworks**: FastAPI, Flask, Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch<br>" +
            "• **Databases**: MySQL, PostgreSQL, MSSQL, DB2<br>" +
            "• **Web Tech**: HTML, CSS, JavaScript, React, Next.js<br>" +
            "• **Tools**: Git, GitHub, Docker, Prisma ORM, Jupyter Notebook",
            
    projects: "Nandhu has built several innovative projects. Ask me about any of these to know more:<br><br>" +
              "1. **LifeRush**: AI Blood Donation matching system.<br>" +
              "2. **Twitter Sentiment Analysis**: NLP classification platform.<br>" +
              "3. **Student Allotment**: seat allotment allocation system.<br>" +
              "4. **PDF2Audio**: PDF text-to-speech audio converter.",
              
    liferush: "**LifeRush Blood Donation Platform**:<br>" +
              "• **Tech Stack**: FastAPI, PostgreSQL, Machine Learning<br>" +
              "• **Key Features**: AI-powered donor matching, JWT authentication, Emergency donor ranking algorithm, REST API implementation.",
              
    twitter: "**Twitter Sentiment Analysis System**:<br>" +
             "• **Tech Stack**: Python, Flask, Pandas, NumPy, NLP<br>" +
             "• **Key Features**: Sentiment classification, automated data preprocessing, analytical trend visualizations, features engineering dashboard.",
             
    studentallotment: "**Student Allotment Webapp**:<br>" +
                      "• **Tech Stack**: Python, Web Framework, SQL, Algorithms<br>" +
                      "• **Key Features**: Merit ranking processing, multi-category seat reservations mapping, dynamic vacancy tracking, automatic allotment slip generation.",
                      
    pdf2audio: "**PDF2Audio Converter**:<br>" +
               "• **Tech Stack**: Python, PyPDF2, pyttsx3 / gTTS, Audio Processing<br>" +
               "• **Key Features**: Multi-page layout text extraction, adjustable reading speed & voice knobs, offline MP3 audio compilation.",
                 
    education: "Nandhu's academic history:<br><br>" +
               "• **Master of Computer Applications (MCA)** (2024–2026)<br>" +
               "&nbsp;&nbsp;*Alliance University, Bangalore* | **CGPA: 9.2**<br>" +
               "• **Bachelor of Science in Mathematics (B.Sc)** (2021–2024)<br>" +
               "&nbsp;&nbsp;*Amrita Vishwa Vidyapeetham* | **CGPA: 6.35**",
               
    experience: "Nandhu works as a **Mainframe Developer Intern** at **Teamware Solutions** (Dec 2025 – Present).<br>" +
                "He developed a **COBOL-based Payroll & Profit Optimization System** for farm payroll automations, production cost analytics, revenue tracking, and financial reporting.",
                
    contact: "You can reach out to Nandhu S through:<br>" +
             "• **Email**: nandhus5270kvk@gmail.com<br>" +
             "• **LinkedIn**: linkedin.com/in/nandhu-s-273029246<br>" +
             "• **GitHub**: github.com/Ccodgodd<br>" +
             "• **Phone**: +91 XXXXX XXXXX",
             
    resume: "You can find Nandhu's ATS-friendly resume in the **Resume Section** of the website. You can preview it there or click the **Download Resume** button to get a PDF copy.",
    
    achievements: "Nandhu's key achievements include:<br>" +
                  "• **150+ Problems solved** on LeetCode.<br>" +
                  "• **Finalist** at HackCulture Hackathon.<br>" +
                  "• **University representative** in Badminton.",
                  
    default: "I'm not sure I understand that. Try asking about Nandhu's **projects**, **skills**, **education**, **experience**, **resume**, or **contact** details!"
  };

  function formatMessageText(text) {
    // Basic bold markdown formatter
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.innerHTML = formatMessageText(text);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active') && chatbotMessages.children.length === 0) {
      setTimeout(() => {
        appendMessage('bot', botResponses.greetings);
      }, 300);
    }
  });

  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });

  function handleBotResponse(userInput) {
    const inputClean = userInput.toLowerCase().trim();
    let responseKey = 'default';

    // Loop keywords check
    for (const key in chatbotKnowledge) {
      const keywords = chatbotKnowledge[key];
      if (keywords.some(word => inputClean.includes(word))) {
        responseKey = key;
        break;
      }
    }

    // Delayed reply to simulate typing
    setTimeout(() => {
      appendMessage('bot', botResponses[responseKey]);
    }, 600);
  }

  function sendMessage() {
    const text = chatbotInput.value.trim();
    if (text) {
      appendMessage('user', text);
      chatbotInput.value = '';
      handleBotResponse(text);
    }
  }

  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // 10. CONTACT FORM SUBMISSION
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        // Success notification popup
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '30px';
        notification.style.left = '30px';
        notification.style.background = 'var(--accent-blue)';
        notification.style.color = '#ffffff';
        notification.style.padding = '15px 30px';
        notification.style.borderRadius = '6px';
        notification.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        notification.style.zIndex = '9999';
        notification.style.fontSize = '0.9rem';
        notification.style.borderLeft = '4px solid var(--accent-yellow)';
        notification.textContent = 'Message sent successfully! (Simulated response)';

        document.body.appendChild(notification);
        contactForm.reset();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        setTimeout(() => {
          notification.remove();
        }, 4000);
      }, 1500);
    });
  }

  // 11. SMOOTH SCROLL INTEGRATION FOR ANCHORS
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close nav menu on mobile
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('active');

        // Scroll to target smoothly with offset
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 12. CUSTOM CURSOR TRACKING
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorOutline = document.getElementById('custom-cursor-outline');

  if (cursorDot && cursorOutline) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Position the small central dot instantly
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth physics ease for outer circle delay
    function animateCursor() {
      const ease = 0.15;
      outlineX += (mouseX - outlineX) * ease;
      outlineY += (mouseY - outlineY) * ease;
      
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Trigger hover scale on all interactive components
    function updateCursorListeners() {
      const targets = document.querySelectorAll('a, button, [role="button"], input, textarea, .project-card, .skill-category, .education-card, .achievement-card, .exp-card, .chatbot-toggle');
      targets.forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorOutline.classList.add('hover');
          cursorDot.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
          cursorOutline.classList.remove('hover');
          cursorDot.classList.remove('hover');
        });
      });
    }

    updateCursorListeners();
    
    // Periodically rebind in case chatbot adds messages dynamically
    setInterval(updateCursorListeners, 2000);

    // Clicking click animation state
    document.addEventListener('mousedown', () => {
      cursorOutline.classList.add('click');
    });
    document.addEventListener('mouseup', () => {
      cursorOutline.classList.remove('click');
    });
  }
});
