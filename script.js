// PENTING: File PDF Sumber Anda
const url = 'FIle_Document_SOP.pdf'; 

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d');

const renderPage = num => {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
        const baseScale = 2.0; 
        const viewport = page.getViewport({ scale: baseScale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 
            ? [outputScale, 0, 0, outputScale, 0, 0] 
            : null;

        const renderCtx = { 
            canvasContext: ctx, 
            transform: transform,
            viewport: viewport 
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Update indikator halaman
        const pageNumEl = document.getElementById('page-num');
        if(pageNumEl) pageNumEl.textContent = num;
    });
};

const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

const getPageFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/page=(\d+)/);
    if (match) return parseInt(match[1], 10);
    return 1;
};

// Navigasi
const showPrevPage = () => {
    if (pageNum <= 1) return;
    window.location.hash = `page=${pageNum - 1}`; 
};

const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    window.location.hash = `page=${pageNum + 1}`; 
};

// Pemuatan Dokumen Pertama
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    
    const pageCountEl = document.getElementById('page-count');
    if(pageCountEl) pageCountEl.textContent = pdfDoc.numPages;

    let targetPage = getPageFromHash();
    if (targetPage > pdfDoc.numPages) targetPage = pdfDoc.numPages;
    if (targetPage < 1) targetPage = 1;
    
    pageNum = targetPage;
    renderPage(pageNum);
}).catch(err => {
    console.error("Error memuat PDF:", err);
    alert("Gagal memuat PDF. Pastikan nama file sudah sesuai.");
});

// =============================================
//      EVENT LISTENERS UTAMA
// =============================================

// Tombol Navigasi Bawah
const prevBtn = document.getElementById('prev-page');
if(prevBtn) prevBtn.addEventListener('click', showPrevPage);

const nextBtn = document.getElementById('next-page');
if(nextBtn) nextBtn.addEventListener('click', showNextPage);

// =============================================
// LOGIKA PANEL PROFIL MELAYANG (FAB LOGIC)
// =============================================
const fabBtn = document.getElementById('fab-profile-btn');
const closeBtn = document.getElementById('close-panel-btn');
const profilePanel = document.getElementById('profile-panel');

if(fabBtn && closeBtn && profilePanel) {
    // Buka Panel saat klik ikon melayang
    fabBtn.addEventListener('click', () => {
        profilePanel.classList.add('open');
    });

    // Tutup Panel saat klik tanda silang (X)
    closeBtn.addEventListener('click', () => {
        profilePanel.classList.remove('open'); 
    });

    // Tutup Panel otomatis jika klik area gelap di luar panel
    document.addEventListener('click', (event) => {
        const isClickInsidePanel = profilePanel.contains(event.target);
        const isClickInsideFab = fabBtn.contains(event.target);

        if (!isClickInsidePanel && !isClickInsideFab && profilePanel.classList.contains('open')) {
            profilePanel.classList.remove('open');
        }
    });
}

// Tombol Keyboard Panah
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPrevPage();
    else if (event.key === 'ArrowRight') showNextPage();
});

// Hash URL
window.addEventListener('hashchange', () => {
    if (!pdfDoc) return; 
    
    let newPage = getPageFromHash();
    if (newPage > pdfDoc.numPages) newPage = pdfDoc.numPages;
    if (newPage < 1) newPage = 1;

    if (newPage !== pageNum) {
        pageNum = newPage;
        queueRenderPage(pageNum);
    }
});

// Penanganan Gambar Foto Profil
const fotoProfil = document.getElementById('foto-profil');
if (fotoProfil) {
    fotoProfil.addEventListener('error', function() {
        this.src = 'https://via.placeholder.com/100?text=Wemvi';
    });
}

// Fitur Favicon
function buatFaviconBulat(urlGambar) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        let linkFavicon = document.querySelector("link[rel*='icon']");
        if (!linkFavicon) {
            linkFavicon = document.createElement('link');
            linkFavicon.rel = 'icon';
            document.head.appendChild(linkFavicon);
        }
        linkFavicon.href = canvas.toDataURL('image/png');
    };
    img.src = urlGambar;
}
buatFaviconBulat('logo.png');
