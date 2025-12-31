// Global Variables
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

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Show intro animation
    setTimeout(() => {
        document.getElementById('introScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('introScreen').style.display = 'none';
            showAuthSection();
        }, 500);
    }, 3000);

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    const savedApartment = localStorage.getItem('currentApartment');
    
    if (savedUser && savedApartment) {
        currentUser = JSON.parse(savedUser);
        currentApartment = JSON.parse(savedApartment);
        loadApartmentData();
        showMainDashboard();
    }
});

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark');
    document.getElementById('themeIcon').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Language Toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    document.getElementById('langToggle').textContent = currentLanguage === 'en' ? 'हिंदी' : 'English';
    updateLanguage();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${currentLanguage}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = el.getAttribute(`data-placeholder-${currentLanguage}`) || text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 text-white px-6 py-3 rounded-lg shadow-lg`;
    notification.textContent = message;
    
    document.getElementById('notifications').appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Auth Section
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

// Avatar Selection
function showAvatarSelection(mode) {
    avatarSelectionMode = mode;
    document.getElementById('avatarModal').classList.remove('hidden');
}

function selectAvatar(avatar) {
    selectedAvatar = avatar;
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
}

function confirmAvatar() {
    if (!selectedAvatar) {
        showNotification('Please select an avatar', 'error');
        return;
    }
    
    document.getElementById('avatarModal').classList.add('hidden');
    
    if (avatarSelectionMode === 'secretary') {
        registerApartment();
    } else if (avatarSelectionMode === 'join') {
        joinSociety();
    }
}

// Register Apartment (Secretary)
function registerApartment() {
    const secretaryName = document.getElementById('secretaryName').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    const secretaryPhone = document.getElementById('secretaryPhone').value.trim();
    const secretaryEmail = document.getElementById('secretaryEmail').value.trim();
    const defaultMaintenance = parseFloat(document.getElementById('defaultMaintenance').value) || 1000;
    
    if (!secretaryName || !apartmentName || !secretaryPhone) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Create apartment
    currentApartment = {
        id: generateId(),
        name: apartmentName,
        secretaryPhone: secretaryPhone,
        secretaryEmail: secretaryEmail,
        defaultMaintenance: defaultMaintenance,
        createdAt: Date.now()
    };
    
    // Create secretary user
    currentUser = {
        id: generateId(),
        name: secretaryName,
        phone: secretaryPhone,
        email: secretaryEmail,
        flat: 'Secretary',
        familyMembers: 1,
        role: 'secretary',
        avatar: selectedAvatar,
        apartmentId: currentApartment.id,
        createdAt: Date.now()
    };
    
    residents.push(currentUser);
    
    // Save to localStorage
    saveApartmentData();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentApartment', JSON.stringify(currentApartment));
    
    showNotification(`Welcome ${secretaryName}! ${apartmentName} registered successfully!`, 'success');
    showMainDashboard();
}

// Join Society
function joinSociety() {
    const inviteCode = document.getElementById('joinInviteCode').value.trim();
    const name = document.getElementById('joinName').value.trim();
    const phone = document.getElementById('joinPhone').value.trim();
    const flat = document.getElementById('joinFlat').value.trim();
    const email = document.getElementById('joinEmail').value.trim();
    const familyMembers = parseInt(document.getElementById('joinMembers').value) || 1;
    
    if (!inviteCode || !name || !phone || !flat) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Verify invite code
    const invite = inviteCodes.find(i => i.code === inviteCode && i.used === false);
    if (!invite) {
        showNotification('Invalid or expired invitation code', 'error');
        return;
    }
    
    // Create resident user
    currentUser = {
        id: generateId(),
        name: name,
        phone: phone,
        email: email,
        flat: flat,
        familyMembers: familyMembers,
        role: 'resident',
        avatar: selectedAvatar,
        apartmentId: currentApartment.id,
        createdAt: Date.now()
    };
    
    residents.push(currentUser);
    
    // Mark invite as used
    invite.used = true;
    invite.usedBy = currentUser.id;
    invite.usedAt = Date.now();
    
    // Save to localStorage
    saveApartmentData();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification(`Welcome ${name}! You've joined successfully!`, 'success');
    showMainDashboard();
}

// Login User
function loginUser() {
    const phone = document.getElementById('loginPhone').value.trim();
    
    if (!phone) {
        showNotification('Please enter phone number', 'error');
        return;
    }
    
    // Load all apartments from localStorage
    const allApartments = JSON.parse(localStorage.getItem('allApartments') || '[]');
    
    // Find user across all apartments
    let foundUser = null;
    let foundApartment = null;
    
    for (const apt of allApartments) {
        const resident = apt.residents.find(r => r.phone === phone);
        if (resident) {
            foundUser = resident;
            foundApartment = {
                id: apt.id,
                name: apt.name,
                secretaryPhone: apt.secretaryPhone,
                secretaryEmail: apt.secretaryEmail,
                defaultMaintenance: apt.defaultMaintenance,
                createdAt: apt.createdAt
            };
            
            // Load apartment data
            residents = apt.residents || [];
            expenses = apt.expenses || [];
            maintenanceRecords = apt.maintenanceRecords || [];
            contributions = apt.contributions || [];
            announcements = apt.announcements || [];
            inviteCodes = apt.inviteCodes || [];
            chatMessages = apt.chatMessages || [];
            paymentInfo = apt.paymentInfo || null;
            
            break;
        }
    }
    
    if (!foundUser) {
        showNotification('Phone number not found. Please register first.', 'error');
        return;
    }
    
    currentUser = foundUser;
    currentApartment = foundApartment;
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('currentApartment', JSON.stringify(currentApartment));
    
    showNotification(`Welcome back ${foundUser.name}!`, 'success');
    showMainDashboard();
}

// Show Main Dashboard
function showMainDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('secretaryRegistration').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');
    
    // Update header
    document.getElementById('apartmentNameHeader').textContent = currentApartment.name;
    document.getElementById('currentUserInfo').innerHTML = `
        <div id="userAvatarHeader" class="text-2xl">${currentUser.avatar}</div>
        <span>${currentUser.name} (${currentUser.role === 'secretary' ? 'Secretary' : currentUser.flat})</span>
    `;
    
    // Show/hide secretary-only sections
    if (currentUser.role === 'secretary') {
        document.getElementById('invitationsTab').classList.remove('hidden');
        document.getElementById('createAnnouncement').classList.remove('hidden');
        document.getElementById('paymentInfo').classList.remove('hidden');
    }
    
    // Load dashboard data
    updateDashboard();
    showSection('dashboard');
}

// Show Section
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-200');
    });
    
    event.target.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-200');
    event.target.classList.add('bg-blue-600', 'text-white');
    
    // Load section-specific data
    if (section === 'residents') {
        loadResidentsTable();
    } else if (section === 'maintenance') {
        loadMaintenanceSection();
    } else if (section === 'expenses') {
        loadExpensesSection();
    } else if (section === 'payment') {
        loadPaymentSection();
    } else if (section === 'analytics') {
        loadAnalytics();
    } else if (section === 'chat') {
        loadChatSection();
    } else if (section === 'announcements') {
        loadAnnouncementsSection();
    } else if (section === 'invitations') {
        loadInvitationsSection();
    }
}

// Update Dashboard
function updateDashboard() {
    const totalResidentsCount = residents.length;
    const maintenanceCollectedAmount = maintenanceRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const contributionsAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const availableBalanceAmount = maintenanceCollectedAmount - totalExpensesAmount + contributionsAmount;
    
    document.getElementById('totalResidents').textContent = totalResidentsCount;
    document.getElementById('maintenanceCollected').textContent = `₹${maintenanceCollectedAmount.toLocaleString()}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpensesAmount.toLocaleString()}`;
    document.getElementById('availableBalance').textContent = `₹${availableBalanceAmount.toLocaleString()}`;
}

// Load Residents Table
function loadResidentsTable() {
    const tbody = document.getElementById('residentsTable');
    tbody.innerHTML = '';
    
    residents.forEach(resident => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 dark:border-gray-700';
        row.innerHTML = `
            <td class="px-4 py-3 text-2xl">${resident.avatar}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.name}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.flat}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.familyMembers}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.phone}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.email || '-'}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded ${resident.role === 'secretary' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">${resident.role === 'secretary' ? 'Secretary' : 'Resident'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Load Maintenance Section
function loadMaintenanceSection() {
    // Populate resident dropdowns
    const paymentSelect = document.getElementById('paymentResident');
    const contributionSelect = document.getElementById('contributionResident');
    
    paymentSelect.innerHTML = '<option value="">Select Resident</option>';
    contributionSelect.innerHTML = '<option value="">Select Resident</option>';
    
    residents.filter(r => r.role !== 'secretary').forEach(resident => {
        const option = document.createElement('option');
        option.value = resident.id;
        option.textContent = `${resident.name} - ${resident.flat}`;
        paymentSelect.appendChild(option.cloneNode(true));
        contributionSelect.appendChild(option);
    });
    
    // Load maintenance status table
    loadMaintenanceStatusTable();
}

function loadMaintenanceStatusTable() {
    const tbody = document.getElementById('maintenanceStatusTable');
    tbody.innerHTML = '';
    
    residents.filter(r => r.role !== 'secretary').forEach(resident => {
        const paid = maintenanceRecords
            .filter(m => m.residentId === resident.id)
            .reduce((sum, m) => sum + m.amount, 0);
        
        const contribution = contributions
            .filter(c => c.residentId === resident.id)
            .reduce((sum, c) => sum + c.amount, 0);
        
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const residentCount = residents.filter(r => r.role !== 'secretary').length;
        const extraShare = residentCount > 0 ? totalExpenses / residentCount : 0;
        
        const extraPaid = maintenanceRecords
            .filter(m => m.residentId === resident.id && m.type === 'extra')
            .reduce((sum, m) => sum + m.amount, 0);
        
        const monthlyDue = currentApartment.defaultMaintenance;
        const totalDue = monthlyDue + extraShare;
        const totalPaidAmount = paid + contribution + extraPaid;
        
        const status = totalPaidAmount >= totalDue ? 'Paid' : 'Pending';
        
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 dark:border-gray-700';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.name}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">${resident.flat}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200">₹${monthlyDue.toFixed(2)}</td>
            <td class="px-4 py-3 text-green-600">₹${paid.toFixed(2)}</td>
            <td class="px-4 py-3 text-blue-600">₹${contribution.toFixed(2)}</td>
            <td class="px-4 py-3 text-orange-600">₹${extraShare.toFixed(2)}</td>
            <td class="px-4 py-3 text-purple-600">₹${extraPaid.toFixed(2)}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded ${status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">${status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Record Maintenance Payment
function recordMaintenancePayment() {
    const residentId = document.getElementById('paymentResident').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const reference = document.getElementById('paymentReference').value.trim();
    
    if (!residentId || !amount) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const resident = residents.find(r => r.id === residentId);
    if (!resident) {
        showNotification('Resident not found', 'error');
        return;
    }
    
    const payment = {
        id: generateId(),
        residentId: residentId,
        residentName: resident.name,
        amount: amount,
        reference: reference,
        type: 'regular',
        recordedBy: currentUser.id,
        timestamp: Date.now()
    };
    
    maintenanceRecords.push(payment);
    saveApartmentData();
    
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentReference').value = '';
    
    showNotification(`Payment of ₹${amount} recorded for ${resident.name}`, 'success');
    loadMaintenanceStatusTable();
    updateDashboard();
}

// Record Contribution
function recordContribution() {
    const residentId = document.getElementById('contributionResident').value;
    const amount = parseFloat(document.getElementById('contributionAmount').value);
    const details = document.getElementById('contributionDetails').value.trim();
    
    if (!residentId || !amount || !details) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const resident = residents.find(r => r.id === residentId);
    if (!resident) {
        showNotification('Resident not found', 'error');
        return;
    }
    
    const contribution = {
        id: generateId(),
        residentId: residentId,
        residentName: resident.name,
        amount: amount,
        details: details,
        recordedBy: currentUser.id,
        timestamp: Date.now()
    };
    
    contributions.push(contribution);
    saveApartmentData();
    
    document.getElementById('contributionAmount').value = '';
    document.getElementById('contributionDetails').value = '';
    
    showNotification(`Contribution of ₹${amount} recorded for ${resident.name}`, 'success');
    loadMaintenanceStatusTable();
    updateDashboard();
}

// Load Expenses Section
function loadExpensesSection() {
    // Load expense summary
    const summaryDiv = document.getElementById('expenseSummary');
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const residentCount = residents.filter(r => r.role !== 'secretary').length;
    const perResidentShare = residentCount > 0 ? totalExpensesAmount / residentCount : 0;
    
    summaryDiv.innerHTML = `
        <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Extra Expenses</p>
            <p class="text-3xl font-bold text-red-600">₹${totalExpensesAmount.toFixed(2)}</p>
        </div>
        <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">Per Resident Share</p>
            <p class="text-2xl font-bold text-orange-600">₹${perResidentShare.toFixed(2)}</p>
        </div>
    `;
    
    // Load expenses list
    const listDiv = document.getElementById('expensesList');
    listDiv.innerHTML = '';
    
    if (expenses.length === 0) {
        listDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No expenses recorded yet</p>';
        return;
    }
    
    expenses.slice().reverse().forEach(expense => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${expense.description}</h3>
                <span class="text-red-600 font-bold">₹${expense.amount.toFixed(2)}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${expense.details}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">${new Date(expense.timestamp).toLocaleString()}</p>
        `;
        listDiv.appendChild(div);
    });
}

// Add Expense
function addExpense() {
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const details = document.getElementById('expenseDetails').value.trim();
    
    if (!description || !amount) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const expense = {
        id: generateId(),
        description: description,
        amount: amount,
        details: details,
        addedBy: currentUser.id,
        timestamp: Date.now()
    };
    
    expenses.push(expense);
    saveApartmentData();
    
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDetails').value = '';
    
    showNotification(`Expense added: ${description}`, 'success');
    loadExpensesSection();
    updateDashboard();
    
    // Notify all residents
    const residentCount = residents.filter(r => r.role !== 'secretary').length;
    const perResidentShare = residentCount > 0 ? amount / residentCount : 0;
    createAnnouncement(
        `New Expense: ${description}`,
        `A new expense of ₹${amount.toFixed(2)} has been added. Your share: ₹${perResidentShare.toFixed(2)}. Details: ${details}`,
        'important',
        true
    );
}

// Load Payment Section
function loadPaymentSection() {
    // Load or display payment info
    if (paymentInfo) {
        displayPaymentInfo();
    }
    
    // Pre-fill amount for residents
    if (currentUser.role !== 'secretary') {
        const monthlyDue = currentApartment.defaultMaintenance;
        const paid = maintenanceRecords
            .filter(m => m.residentId === currentUser.id)
            .reduce((sum, m) => sum + m.amount, 0);
        
        const contribution = contributions
            .filter(c => c.residentId === currentUser.id)
            .reduce((sum, c) => sum + c.amount, 0);
        
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const residentCount = residents.filter(r => r.role !== 'secretary').length;
        const extraShare = residentCount > 0 ? totalExpenses / residentCount : 0;
        
        const totalDue = monthlyDue + extraShare;
        const totalPaidAmount = paid + contribution;
        const pendingAmount = totalDue - totalPaidAmount;
        
        document.getElementById('paidAmount').value = pendingAmount > 0 ? pendingAmount.toFixed(2) : '';
    }
}

function savePaymentInfo() {
    const bankName = document.getElementById('bankName').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const ifscCode = document.getElementById('ifscCode').value.trim();
    const upiId = document.getElementById('upiId').value.trim();
    const qrCode = document.getElementById('qrCode').value.trim();
    
    paymentInfo = {
        bankName: bankName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        upiId: upiId,
        qrCode: qrCode,
        updatedAt: Date.now()
    };
    
    saveApartmentData();
    showNotification('Payment information saved successfully', 'success');
    displayPaymentInfo();
}

function displayPaymentInfo() {
    const displayDiv = document.getElementById('paymentDisplay');
    
    if (!paymentInfo) {
        displayDiv.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">Payment information not available yet</p>';
        return;
    }
    
    displayDiv.innerHTML = `
        <div class="space-y-3">
            ${paymentInfo.bankName ? `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${paymentInfo.bankName}</p>
                </div>
            ` : ''}
            ${paymentInfo.accountNumber ? `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${paymentInfo.accountNumber}</p>
                </div>
            ` : ''}
            ${paymentInfo.ifscCode ? `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p class="text-sm text-gray-600 dark:text-gray-400">IFSC Code</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${paymentInfo.ifscCode}</p>
                </div>
            ` : ''}
            ${paymentInfo.upiId ? `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <p class="text-sm text-gray-600 dark:text-gray-400">UPI ID</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${paymentInfo.upiId}</p>
                </div>
            ` : ''}
            ${paymentInfo.qrCode ? `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">QR Code</p>
                    <div class="bg-white p-2 inline-block rounded">
                        <p class="text-xs text-gray-500">QR Code available</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function confirmPayment() {
    const amount = parseFloat(document.getElementById('paidAmount').value);
    const reference = document.getElementById('transactionRef').value.trim();
    
    if (!amount || !reference) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    // Create a payment record (to be verified by secretary)
    const payment = {
        id: generateId(),
        residentId: currentUser.id,
        residentName: currentUser.name,
        amount: amount,
        reference: reference,
        type: 'self-reported',
        verified: false,
        timestamp: Date.now()
    };
    
    maintenanceRecords.push(payment);
    saveApartmentData();
    
    document.getElementById('paidAmount').value = '';
    document.getElementById('transactionRef').value = '';
    
    showNotification('Payment confirmation sent to secretary', 'success');
    
    // Notify secretary
    if (currentUser.role !== 'secretary') {
        const secretary = residents.find(r => r.role === 'secretary');
        if (secretary) {
            createAnnouncement(
                'Payment Confirmation',
                `${currentUser.name} (${currentUser.flat}) has reported a payment of ₹${amount.toFixed(2)}. Reference: ${reference}`,
                'normal',
                true
            );
        }
    }
}

// Load Analytics
function loadAnalytics() {
    // Bar Chart - Monthly Overview
    const barCtx = document.getElementById('barChart').getContext('2d');
    const totalMaintenance = maintenanceRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Maintenance Collected', 'Expenses', 'Contributions'],
            datasets: [{
                label: 'Amount (₹)',
                data: [totalMaintenance, totalExpensesAmount, totalContributions],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(59, 130, 246, 0.7)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Pie Chart - Expense Distribution
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const expenseCategories = {};
    expenses.forEach(e => {
        expenseCategories[e.description] = (expenseCategories[e.description] || 0) + e.amount;
    });
    
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(expenseCategories).length > 0 ? Object.keys(expenseCategories) : ['No Data'],
            datasets: [{
                data: Object.keys(expenseCategories).length > 0 ? Object.values(expenseCategories) : [1],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(251, 191, 36, 0.7)',
                    'rgba(168, 85, 247, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
    
    // Line Chart - Balance Trend
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const balanceData = months.map(() => Math.random() * 50000 + 20000);
    
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Balance (₹)',
                data: balanceData,
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load Chat Section
function loadChatSection() {
    const usersList = document.getElementById('chatUsersList');
    usersList.innerHTML = '';
    
    residents.filter(r => r.id !== currentUser.id).forEach(resident => {
        const div = document.createElement('div');
        div.className = 'bg-gray-100 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200';
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-2xl">${resident.avatar}</div>
                <div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${resident.name}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${resident.flat}</p>
                </div>
            </div>
        `;
        div.onclick = () => openChat(resident);
        usersList.appendChild(div);
    });
}

function openChat(resident) {
    currentChatUser = resident;
    document.getElementById('chatWithUser').textContent = `Chat with ${resident.name}`;
    loadChatMessages();
}

function loadChatMessages() {
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML = '';
    
    if (!currentChatUser) {
        messagesDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Select a resident to start chatting</p>';
        return;
    }
    
    const relevantMessages = chatMessages.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === currentChatUser.id) ||
        (m.senderId === currentChatUser.id && m.receiverId === currentUser.id)
    );
    
    if (relevantMessages.length === 0) {
        messagesDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No messages yet</p>';
        return;
    }
    
    relevantMessages.forEach(message => {
        const div = document.createElement('div');
        div.className = `chat-message mb-3 ${message.senderId === currentUser.id ? 'text-right' : 'text-left'}`;
        div.innerHTML = `
            <div class="inline-block max-w-xs ${message.senderId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'} rounded-lg px-4 py-2">
                <p>${message.text}</p>
                <p class="text-xs opacity-75 mt-1">${new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
        `;
        messagesDiv.appendChild(div);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text || !currentChatUser) {
        return;
    }
    
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: currentChatUser.id,
        text: text,
        timestamp: Date.now()
    };
    
    chatMessages.push(message);
    saveApartmentData();
    
    input.value = '';
    loadChatMessages();
}

// Load Announcements Section
function loadAnnouncementsSection() {
    // Load latest announcement
    const latestDiv = document.getElementById('latestAnnouncement');
    if (announcements.length > 0) {
        const latest = announcements[announcements.length - 1];
        latestDiv.innerHTML = `
            <div class="bg-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-50 dark:bg-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-900 border border-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-200 dark:border-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-700 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800 dark:text-gray-200">${latest.title}</h3>
                    <span class="text-xs px-2 py-1 rounded bg-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-200 dark:bg-${latest.priority === 'urgent' ? 'red' : latest.priority === 'important' ? 'orange' : 'blue'}-700">${latest.priority}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-2">${latest.message}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(latest.timestamp).toLocaleString()}</p>
            </div>
        `;
    } else {
        latestDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No announcements yet</p>';
    }
    
    // Load all announcements
    const listDiv = document.getElementById('announcementsList');
    listDiv.innerHTML = '';
    
    if (announcements.length === 0) {
        listDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No announcements yet</p>';
        return;
    }
    
    announcements.slice().reverse().forEach(announcement => {
        const div = document.createElement('div');
        div.className = `bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-${announcement.priority === 'urgent' ? 'red' : announcement.priority === 'important' ? 'orange' : 'blue'}-500`;
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${announcement.title}</h3>
                <span class="text-xs px-2 py-1 rounded bg-${announcement.priority === 'urgent' ? 'red' : announcement.priority === 'important' ? 'orange' : 'blue'}-100 dark:bg-${announcement.priority === 'urgent' ? 'red' : announcement.priority === 'important' ? 'orange' : 'blue'}-900 text-${announcement.priority === 'urgent' ? 'red' : announcement.priority === 'important' ? 'orange' : 'blue'}-800 dark:text-${announcement.priority === 'urgent' ? 'red' : announcement.priority === 'important' ? 'orange' : 'blue'}-200">${announcement.priority}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-2">${announcement.message}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">Posted by ${announcement.authorName} on ${new Date(announcement.timestamp).toLocaleString()}</p>
        `;
        listDiv.appendChild(div);
    });
}

function createAnnouncement(title = null, message = null, priority = null, isAutomatic = false) {
    let announcementTitle, announcementMessage, announcementPriority;
    
    if (isAutomatic) {
        announcementTitle = title;
        announcementMessage = message;
        announcementPriority = priority;
    } else {
        announcementTitle = document.getElementById('announcementTitle').value.trim();
        announcementMessage = document.getElementById('announcementMessage').value.trim();
        announcementPriority = document.getElementById('announcementPriority').value;
        
        if (!announcementTitle || !announcementMessage) {
            showNotification('Please fill all fields', 'error');
            return;
        }
    }
    
    const announcement = {
        id: generateId(),
        title: announcementTitle,
        message: announcementMessage,
        priority: announcementPriority,
        authorId: currentUser.id,
        authorName: currentUser.name,
        timestamp: Date.now()
    };
    
    announcements.push(announcement);
    saveApartmentData();
    
    if (!isAutomatic) {
        document.getElementById('announcementTitle').value = '';
        document.getElementById('announcementMessage').value = '';
        document.getElementById('announcementPriority').value = 'normal';
        
        showNotification('Announcement posted successfully', 'success');
    }
    
    loadAnnouncementsSection();
}

// Load Invitations Section
function loadInvitationsSection() {
    const activeDiv = document.getElementById('activeInvitations');
    const activeInvites = inviteCodes.filter(i => !i.used);
    
    activeDiv.innerHTML = '';
    
    if (activeInvites.length === 0) {
        activeDiv.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">No active invitations</p>';
        return;
    }
    
    activeInvites.forEach(invite => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-bold text-blue-600 text-xl">${invite.code}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Created: ${new Date(invite.createdAt).toLocaleString()}</p>
                </div>
                <span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Active</span>
            </div>
        `;
        activeDiv.appendChild(div);
    });
}

function generateInviteCode() {
    const code = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const invite = {
        id: generateId(),
        code: code,
        createdBy: currentUser.id,
        createdAt: Date.now(),
        used: false,
        usedBy: null,
        usedAt: null
    };
    
    inviteCodes.push(invite);
    saveApartmentData();
    
    document.getElementById('generatedInviteCode').textContent = code;
    document.getElementById('inviteCodeDisplay').classList.remove('hidden');
    
    showNotification('Invitation code generated successfully', 'success');
    loadInvitationsSection();
}

function copyInviteCode() {
    const code = document.getElementById('generatedInviteCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Invitation code copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentApartment');
    currentUser = null;
    currentApartment = null;
    window.location.reload();
}

// Helper Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function loadApartmentData() {
    const allApartments = JSON.parse(localStorage.getItem('allApartments') || '[]');
    const apartment = allApartments.find(a => a.id === currentApartment.id);
    
    if (apartment) {
        residents = apartment.residents || [];
        expenses = apartment.expenses || [];
        maintenanceRecords = apartment.maintenanceRecords || [];
        contributions = apartment.contributions || [];
        announcements = apartment.announcements || [];
        inviteCodes = apartment.inviteCodes || [];
        chatMessages = apartment.chatMessages || [];
        paymentInfo = apartment.paymentInfo || null;
    }
}

function saveApartmentData() {
    const allApartments = JSON.parse(localStorage.getItem('allApartments') || '[]');
    const index = allApartments.findIndex(a => a.id === currentApartment.id);
    
    const apartmentData = {
        id: currentApartment.id,
        name: currentApartment.name,
        secretaryPhone: currentApartment.secretaryPhone,
        secretaryEmail: currentApartment.secretaryEmail,
        defaultMaintenance: currentApartment.defaultMaintenance,
        createdAt: currentApartment.createdAt,
        residents: residents,
        expenses: expenses,
        maintenanceRecords: maintenanceRecords,
        contributions: contributions,
        announcements: announcements,
        inviteCodes: inviteCodes,
        chatMessages: chatMessages,
        paymentInfo: paymentInfo
    };
    
    if (index >= 0) {
        allApartments[index] = apartmentData;
    } else {
        allApartments.push(apartmentData);
    }
    
    localStorage.setItem('allApartments', JSON.stringify(allApartments));
}