/***********************
 GLOBAL VARIABLES
************************/
let currentLanguage = 'en';
let isDarkMode = false;
let currentUser = null;
let currentApartment = null;
let selectedAvatar = null;
let avatarSelectionMode = null;

let residents = [];
let expenses = [];
let maintenanceRecords = [];
let contributions = [];
let announcements = [];
let inviteCodes = [];
let chatMessages = [];
let currentChatUser = null;
let paymentInfo = null;

/***********************
 INITIALIZATION
************************/
document.addEventListener('DOMContentLoaded', () => {

    // Intro
    setTimeout(() => {
        document.getElementById('introScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('introScreen').style.display = 'none';
            showAuthSection();
        }, 500);
    }, 3000);

    // Theme
    if (localStorage.getItem('theme') === 'dark') {
        isDarkMode = true;
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Session restore
    const savedUser = localStorage.getItem('currentUser');
    const savedApartment = localStorage.getItem('currentApartment');

    if (savedUser && savedApartment) {
        currentUser = JSON.parse(savedUser);
        currentApartment = JSON.parse(savedApartment);
        loadApartmentData();
        showMainDashboard();
    }
});

/***********************
 BASIC UI FUNCTIONS
************************/
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark');
    document.getElementById('themeIcon').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function showNotification(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `notification bg-${type === 'error' ? 'red' : 'green'}-500 text-white px-4 py-2 rounded`;
    div.textContent = message;
    document.getElementById('notifications').appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

/***********************
 AUTH SCREENS
************************/
function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('secretaryRegistration').classList.add('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

function showSecretaryRegistration() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('secretaryRegistration').classList.remove('hidden');
}

/***********************
 AVATAR
************************/
function showAvatarSelection(mode) {
    avatarSelectionMode = mode;
    document.getElementById('avatarModal').classList.remove('hidden');
}

function selectAvatar(avatar, e) {
    selectedAvatar = avatar;
    document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
    e.target.classList.add('selected');
}

function confirmAvatar() {
    if (!selectedAvatar) {
        showNotification('Select an avatar', 'error');
        return;
    }
    document.getElementById('avatarModal').classList.add('hidden');
    avatarSelectionMode === 'secretary' ? registerApartment() : joinSociety();
}

/***********************
 SECRETARY REGISTER
************************/
function registerApartment() {

    const name = secretaryName.value.trim();
    const apt = apartmentName.value.trim();
    const phone = secretaryPhone.value.trim();
    const email = secretaryEmail.value.trim();
    const maintenance = parseFloat(defaultMaintenance.value) || 1000;

    if (!name || !apt || !phone) {
        showNotification('Fill required fields', 'error');
        return;
    }

    currentApartment = {
        id: generateId(),
        name: apt,
        secretaryPhone: phone,
        secretaryEmail: email,
        defaultMaintenance: maintenance,
        createdAt: Date.now()
    };

    currentUser = {
        id: generateId(),
        name,
        phone,
        email,
        flat: 'Secretary',
        familyMembers: 1,
        role: 'secretary',
        avatar: selectedAvatar,
        apartmentId: currentApartment.id,
        createdAt: Date.now()
    };

    residents = [currentUser];
    saveApartmentData();

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentApartment', JSON.stringify(currentApartment));

    showNotification('Apartment registered successfully');
    showMainDashboard();
}

/***********************
 🔥 FIXED JOIN SOCIETY
************************/
function joinSociety() {

    const code = joinInviteCode.value.trim();
    const name = joinName.value.trim();
    const phone = joinPhone.value.trim();
    const flat = joinFlat.value.trim();
    const email = joinEmail.value.trim();
    const members = parseInt(joinMembers.value) || 1;

    if (!code || !name || !phone || !flat) {
        showNotification('Fill required fields', 'error');
        return;
    }

    const allApartments = JSON.parse(localStorage.getItem('allApartments') || '[]');

    let foundApartment = null;
    let foundInvite = null;

    for (const apt of allApartments) {
        const inv = (apt.inviteCodes || []).find(i => i.code === code && !i.used);
        if (inv) {
            foundApartment = apt;
            foundInvite = inv;
            break;
        }
    }

    if (!foundApartment) {
        showNotification('Invalid or expired invitation code', 'error');
        return;
    }

    currentApartment = {
        id: foundApartment.id,
        name: foundApartment.name,
        secretaryPhone: foundApartment.secretaryPhone,
        secretaryEmail: foundApartment.secretaryEmail,
        defaultMaintenance: foundApartment.defaultMaintenance,
        createdAt: foundApartment.createdAt
    };

    residents = foundApartment.residents || [];
    expenses = foundApartment.expenses || [];
    maintenanceRecords = foundApartment.maintenanceRecords || [];
    contributions = foundApartment.contributions || [];
    announcements = foundApartment.announcements || [];
    inviteCodes = foundApartment.inviteCodes || [];
    chatMessages = foundApartment.chatMessages || [];
    paymentInfo = foundApartment.paymentInfo || null;

    if (residents.some(r => r.phone === phone)) {
        showNotification('Phone already registered', 'error');
        return;
    }

    currentUser = {
        id: generateId(),
        name,
        phone,
        email,
        flat,
        familyMembers: members,
        role: 'resident',
        avatar: selectedAvatar,
        apartmentId: currentApartment.id,
        createdAt: Date.now()
    };

    residents.push(currentUser);

    foundInvite.used = true;
    foundInvite.usedBy = currentUser.id;
    foundInvite.usedAt = Date.now();

    saveApartmentData();

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentApartment', JSON.stringify(currentApartment));

    showNotification(`Joined ${currentApartment.name} successfully`);
    showMainDashboard();
}

/***********************
 LOGIN
************************/
function loginUser() {
    const phone = loginPhone.value.trim();
    const allApartments = JSON.parse(localStorage.getItem('allApartments') || '[]');

    for (const apt of allApartments) {
        const user = (apt.residents || []).find(r => r.phone === phone);
        if (user) {
            currentUser = user;
            currentApartment = apt;
            loadApartmentData();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentApartment', JSON.stringify(currentApartment));
            showMainDashboard();
            return;
        }
    }

    showNotification('User not found', 'error');
}

/***********************
 DASHBOARD
************************/
function showMainDashboard() {
    authSection.classList.add('hidden');
    loginForm.classList.add('hidden');
    secretaryRegistration.classList.add('hidden');
    mainDashboard.classList.remove('hidden');
    apartmentNameHeader.textContent = currentApartment.name;
}

/***********************
 INVITES
************************/
function generateInviteCode() {
    const code = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    inviteCodes.push({
        id: generateId(),
        code,
        used: false,
        createdAt: Date.now()
    });

    saveApartmentData();
    generatedInviteCode.textContent = code;
    inviteCodeDisplay.classList.remove('hidden');
}

/***********************
 STORAGE
************************/
function saveApartmentData() {
    let all = JSON.parse(localStorage.getItem('allApartments') || '[]');
    const idx = all.findIndex(a => a.id === currentApartment.id);

    const data = {
        ...currentApartment,
        residents,
        expenses,
        maintenanceRecords,
        contributions,
        announcements,
        inviteCodes,
        chatMessages,
        paymentInfo
    };

    idx >= 0 ? all[idx] = data : all.push(data);
    localStorage.setItem('allApartments', JSON.stringify(all));
}

function loadApartmentData() {
    const all = JSON.parse(localStorage.getItem('allApartments') || '[]');
    const apt = all.find(a => a.id === currentApartment.id);
    if (!apt) return;

    residents = apt.residents || [];
    expenses = apt.expenses || [];
    maintenanceRecords = apt.maintenanceRecords || [];
    contributions = apt.contributions || [];
    announcements = apt.announcements || [];
    inviteCodes = apt.inviteCodes || [];
    chatMessages = apt.chatMessages || [];
    paymentInfo = apt.paymentInfo || null;
}

/***********************
 HELPERS
************************/
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentApartment');
    location.reload();
}
