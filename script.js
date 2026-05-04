 // --- DATABASE ---
    const DB = {
        gk: [
            {q: "ভারতের প্রথম মহিলা রাষ্ট্রপতি কে ছিলেন?", o: ["ইন্দিরা গান্ধী", "প্রতিভা পাটিল", "দ্রৌপদী মুর্মু", "সরোজিনী নাইডু"], a: 1},
            {q: "বিশ্ব পরিবেশ দিবস কবে পালিত হয়?", o: ["৫ জুন", "৭ এপ্রিল", "১০ ডিসেম্বর", "১৫ আগস্ট"], a: 0},
            {q: "UNESCO এর সদর দপ্তর কোথায়?", o: ["লন্ডন", "নিউ ইয়র্ক", "প্যারিস", "জেনেভা"], a: 2}
        ],
        math: [
            {q: "যদি 2x + 5 = 15 হয়, তবে x কত?", o: ["5", "10", "7.5", "2.5"], a: 0}
        ],
        reasoning: [
            {q: "2, 4, 8, 16, ? - পরবর্তী সংখ্যাটি কত?", o: ["20", "24", "32", "64"], a: 2}
        ]
    };

    let sec = 'gk', idx = 0;
    let answers = { gk: {}, math: {}, reasoning: {} };
    let reviews = { gk: {}, math: {}, reasoning: {} };
    let timer, timeLeft = 5400; 

    function startExam() {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('exam-interface').style.display = 'block';
        renderQ();
        startTimer();
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            let m = Math.floor(timeLeft/60), s = timeLeft%60;
            document.getElementById('timer').innerText = `${m}:${s<10?'0':''}${s}`;
            if(timeLeft <= 0) autoSubmit();
        }, 1000);
    }

    function renderQ() {
        const q = DB[sec][idx];
        document.getElementById('q-number').innerText = idx + 1;
        document.getElementById('q-text').innerText = q.q;
        let html = "";
        q.o.forEach((opt, i) => {
            const active = answers[sec][idx] === i ? 'selected' : '';
            html += `<button class="opt-btn ${active}" onclick="selectOpt(${i})">${String.fromCharCode(65+i)}. ${opt}</button>`;
        });
        document.getElementById('opt-container').innerHTML = html;
        renderPalette();
    }

    function selectOpt(i) {
        answers[sec][idx] = i;
        renderQ();
    }

    function toggleReview() {
        reviews[sec][idx] = !reviews[sec][idx];
        renderPalette();
    }

    function nextQ() {
        if(idx < DB[sec].length - 1) { idx++; renderQ(); }
    }

    function prevQ() {
        if(idx > 0) { idx--; renderQ(); }
    }

    function switchSection(s) {
        sec = s; idx = 0;
        document.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${s}`).classList.add('active');
        renderQ();
    }

    function renderPalette() {
        let html = "";
        DB[sec].forEach((_, i) => {
            let cls = "p-node";
            if(i === idx) cls += " active";
            if(answers[sec][i] !== undefined) cls += " ans";
            if(reviews[sec][i]) cls += " rev";
            html += `<div class="${cls}" onclick="jumpTo(${i})">${i+1}</div>`;
        });
        document.getElementById('q-palette').innerHTML = html;
    }

    function jumpTo(i) { idx = i; renderQ(); }

    function showSubmitConfirm() {
        if(confirm("আপনি কি নিশ্চিত যে পরীক্ষাটি সাবমিট করতে চান?")) autoSubmit();
    }

    function autoSubmit() {
        clearInterval(timer);
        let correct = 0, wrong = 0;
        
        for(let s in DB) {
            DB[s].forEach((q, i) => {
                if(answers[s][i] !== undefined) {
                    if(answers[s][i] === q.a) correct++;
                    else wrong++;
                }
            });
        }

        let rawScore = (correct * 1) - (wrong * 0.33);
        let score = rawScore.toFixed(2);

        // UI Transition
        document.getElementById('exam-interface').style.display = 'none';
        document.getElementById('result-screen').style.display = 'block';
        
        // Show Stats
        document.getElementById('final-score').innerText = score;
        document.getElementById('res-correct').innerText = correct;
        document.getElementById('res-wrong').innerText = wrong;

        saveAndShowLeaderboard(score);
    }

    function saveAndShowLeaderboard(newScore) {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem('hk_leaderboard_v1')) || [];
        } catch(e) { list = []; }

        const entry = { score: parseFloat(newScore), date: new Date().toLocaleDateString() };
        list.push(entry);
        list.sort((a,b) => b.score - a.score);
        list = list.slice(0, 5); // Keep top 5
        
        localStorage.setItem('hk_leaderboard_v1', JSON.stringify(list));

        let html = "";
        list.forEach((en, i) => {
            let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
            html += `<div class="leader-row"><span>${medal} Rank #${i+1} (${en.date})</span> <b>${en.score}</b></div>`;
        });
        document.getElementById('leader-list').innerHTML = html || "No records yet.";
    }