// ranking.js - 랭킹 시스템 전용 파일

// 1. 기록 저장 함수 (저장 누락 방지 및 디버깅용 로그 추가)
function saveRank(lv, t) {
    if(!userNickname) {
        console.error("닉네임이 없어 기록을 저장할 수 없습니다.");
        return;
    }
    
    console.log(`[랭킹 전송] 닉네임: ${userNickname}, 레벨: ${lv}, 시간: ${t}s`);

    const rankData = {
        nickname: userNickname,
        level: lv,
        time: t,
        timestamp: Date.now()
    };

    // Firebase database (db)는 index.html에서 초기화된 것을 그대로 사용합니다.
    db.ref('rankings').push(rankData)
        .then(() => console.log("✅ 서버 저장 완료!"))
        .catch(e => console.error("❌ 저장 실패:", e));
}

// 2. 랭킹 불러오기 함수 (표시 개수 10개로 확대 및 내 기록 하이라이트)
function loadRankings() {
    db.ref('rankings').on('value', snap => {
        const rawData = [];
        snap.forEach(child => { rawData.push(child.val()); });

        // 정렬: 높은 레벨 순 -> 짧은 시간 순
        const sorted = [...rawData].sort((a,b) => (b.level - a.level) || (a.time - b.time));

        // [TOP 10] 표시 (감독님 기록이 밀리지 않게 10개로 늘림)
        const top10 = sorted.slice(0, 10);
        const topRankElement = document.getElementById('topRank');
        
        if (topRankElement) {
            topRankElement.innerHTML = top10.map((v, i) => `
                <tr style="${v.nickname === userNickname ? 'background:rgba(0,251,255,0.3); color:#fff; font-weight:bold;' : ''}">
                    <td>${i+1}위 ${v.nickname}</td>
                    <td>LV${v.level}</td>
                    <td>${v.time}s</td>
                </tr>`).join('');
        }

        // [최근 기록] 표시 (실시간 피드 5개)
        const liveFeed = [...rawData].sort((a,b) => b.timestamp - a.timestamp).slice(0, 5);
        const liveRankElement = document.getElementById('liveRank');
        
        if (liveRankElement) {
            liveRankElement.innerHTML = liveFeed.map(v => `
                <tr><td>${v.nickname}</td><td>LV${v.level}</td><td>${v.time}s</td></tr>`).join('');
        }
    });
}
