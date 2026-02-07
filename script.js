
const state = {
    connected: false,
    walletAddress: '',
    currentSection: 'dashboard',
    records: [],
    accessGrants: [],
    sharedRecords: [],
    consents: []
};

function switchSection(sectionId) {
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    state.currentSection = sectionId;
}

async function connectWallet() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            state.walletAddress = accounts[0];
            state.connected = true;
            
            document.getElementById('walletAddress').textContent = 
                state.walletAddress.slice(0, 6) + '...' + state.walletAddress.slice(-4);
            document.getElementById('walletAddress').classList.add('connected');
            document.getElementById('connectBtn').style.display = 'none';
            
            showNotification('Wallet connected successfully!', 'success');
            loadSampleData();
        } else {
            showNotification('Please install MetaMask!', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect wallet', 'error');
        console.error(error);
    }
}

function uploadRecord(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('file');
    
    if (!file || file.size === 0) {
        showNotification('Please select a file', 'error');
        return;
    }

    const newRecord = {
        id: state.records.length + 1,
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        provider: formData.get('provider'),
        file: file.name,
        date: new Date().toISOString(),
        ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 15),
        txHash: '0x' + Math.random().toString(36).substring(2, 15)
    };

    state.records.unshift(newRecord);
    
    renderRecords();
    updateDashboard();
    event.target.reset();
    
    showNotification('Record uploaded successfully to blockchain!', 'success');
}

function grantAccess(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    const newGrant = {
        id: state.accessGrants.length + 1,
        name: formData.get('name'),
        address: formData.get('address'),
        type: formData.get('accessType'),
        expiration: formData.get('expiration'),
        active: true
    };

    state.accessGrants.push(newGrant);
    
    renderAccessList();
    updateDashboard();
    closeModal('grantAccessModal');
    event.target.reset();
    
    showNotification('Access granted successfully!', 'success');
}

function loadSampleData() {
    state.records = [
        {
            id: 1,
            title: 'Annual Physical Examination',
            description: 'Routine checkup and blood work',
            type: 'checkup',
            provider: 'City Medical Center',
            file: 'physical_2026.pdf',
            date: '2026-01-15',
            ipfsHash: 'QmYwAPJzv5CZsnAzt8auVZRn7HrCCMYMYAtDdzcUUZKTgd',
            txHash: '0x1a2b3c4d5e6f7g8h9i0j'
        },
        {
            id: 2,
            title: 'Blood Test Results',
            description: 'Complete metabolic panel',
            type: 'lab',
            provider: 'Quest Diagnostics',
            file: 'bloodwork_jan2026.pdf',
            date: '2026-01-20',
            ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
            txHash: '0x9i8h7g6f5e4d3c2b1a0j'
        },
        {
            id: 3,
            title: 'Vaccination Record - COVID Booster',
            description: 'Updated COVID-19 vaccination',
            type: 'immunization',
            provider: 'CVS Pharmacy',
            file: 'covid_vaccine_2026.pdf',
            date: '2026-02-01',
            ipfsHash: 'QmPChd2hVbrJ5bfo3WBeTW4iDB65TbmYQPbLPrAYPE2uMB',
            txHash: '0xabcdef123456789'
        }
    ];

    state.accessGrants = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            type: 'Full',
            expiration: '2026-12-31',
            active: true
        },
        {
            id: 2,
            name: 'Insurance Provider',
            address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
            type: 'Limited',
            expiration: '2026-06-30',
            active: true
        }
    ];

    state.sharedRecords = [
        {
            id: 1,
            title: 'Consultation Notes',
            sharedBy: 'Dr. Michael Chen',
            date: '2026-02-01',
            type: 'visit'
        }
    ];

    state.consents = [
        {
            id: 1,
            organization: 'Medical Research Institute',
            purpose: 'Diabetes Research Study',
            dataTypes: 'Lab results, Medical history',
            active: true
        },
        {
            id: 2,
            organization: 'AI Health Analytics',
            purpose: 'Machine Learning Dataset',
            dataTypes: 'Anonymized health metrics',
            active: false
        }
    ];

    updateDashboard();
    renderRecords();
    renderAccessList();
    renderSharedRecords();
    renderConsents();
}

function updateDashboard() {
    document.getElementById('totalRecords').textContent = state.records.length;
    document.getElementById('sharedRecords').textContent = state.accessGrants.length;
    document.getElementById('activeConsents').textContent = state.consents.filter(c => c.active).length;
    document.getElementById('dataRequests').textContent = '3'; // Mock value

    const recentActivity = document.getElementById('recentActivity');
    recentActivity.innerHTML = state.records.slice(0, 3).map(record => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">${record.title}</div>
                    <div class="record-date">${new Date(record.date).toLocaleDateString()}</div>
                </div>
                <span class="record-badge badge-verified">✓ Verified</span>
            </div>
            <div class="record-details">
                <div class="detail-item">
                    <div class="detail-label">Provider</div>
                    <div class="detail-value">${record.provider}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${record.type.toUpperCase()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">IPFS</div>
                    <div class="detail-value">${record.ipfsHash.slice(0, 8)}...</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRecords() {
    const recordsList = document.getElementById('recordsList');
    
    if (state.records.length === 0) {
        recordsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No records yet. Upload your first health record!</p>';
        return;
    }

    recordsList.innerHTML = state.records.map(record => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">${record.title}</div>
                    <div class="record-date">${new Date(record.date).toLocaleDateString()}</div>
                </div>
                <span class="record-badge badge-verified">✓ Verified</span>
            </div>
            <div class="record-details">
                <div class="detail-item">
                    <div class="detail-label">Provider</div>
                    <div class="detail-value">${record.provider}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${record.type.toUpperCase()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">File</div>
                    <div class="detail-value">${record.file}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">IPFS Hash</div>
                    <div class="detail-value">${record.ipfsHash.slice(0, 12)}...</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">TX Hash</div>
                    <div class="detail-value">${record.txHash.slice(0, 12)}...</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Description</div>
                    <div class="detail-value">${record.description}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAccessList() {
    const accessList = document.getElementById('accessList');
    
    if (state.accessGrants.length === 0) {
        accessList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No access grants yet.</p>';
        return;
    }

    accessList.innerHTML = state.accessGrants.map(access => `
        <div class="access-item">
            <div class="access-info">
                <h4>${access.name}</h4>
                <p>${access.address.slice(0, 10)}... • ${access.type} access • Expires: ${access.expiration}</p>
            </div>
            <div class="access-controls">
                <div class="toggle-switch ${access.active ? 'active' : ''}" onclick="toggleAccess(${access.id})"></div>
                <button class="btn btn-secondary" onclick="revokeAccess(${access.id})">Revoke</button>
            </div>
        </div>
    `).join('');
}

function renderSharedRecords() {
    const sharedList = document.getElementById('sharedList');
    
    if (state.sharedRecords.length === 0) {
        sharedList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No records shared with you yet.</p>';
        return;
    }

    sharedList.innerHTML = state.sharedRecords.map(record => `
        <div class="record-card">
            <div class="record-header">
                <div>
                    <div class="record-title">${record.title}</div>
                    <div class="record-date">Shared by: ${record.sharedBy}</div>
                </div>
                <span class="record-badge badge-verified">✓ Verified</span>
            </div>
        </div>
    `).join('');
}

function renderConsents() {
    const consentList = document.getElementById('consentList');
    
    consentList.innerHTML = state.consents.map(consent => `
        <div class="access-item">
            <div class="access-info">
                <h4>${consent.organization}</h4>
                <p>${consent.purpose} • Data: ${consent.dataTypes}</p>
            </div>
            <div class="access-controls">
                <div class="toggle-switch ${consent.active ? 'active' : ''}" onclick="toggleConsent(${consent.id})"></div>
            </div>
        </div>
    `).join('');
}

function toggleAccess(id) {
    const access = state.accessGrants.find(a => a.id === id);
    if (access) {
        access.active = !access.active;
        renderAccessList();
        showNotification(`Access ${access.active ? 'enabled' : 'disabled'} for ${access.name}`, 'success');
    }
}

function revokeAccess(id) {
    state.accessGrants = state.accessGrants.filter(a => a.id !== id);
    renderAccessList();
    updateDashboard();
    showNotification('Access revoked successfully', 'success');
}

function toggleConsent(id) {
    const consent = state.consents.find(c => c.id === id);
    if (consent) {
        consent.active = !consent.active;
        renderConsents();
        updateDashboard();
        showNotification(`Consent ${consent.active ? 'granted' : 'revoked'} for ${consent.organization}`, 'success');
    }
}

function showGrantAccessModal() {
    document.getElementById('grantAccessModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notificationIcon');
    const text = document.getElementById('notificationText');

    icon.textContent = type === 'success' ? '✓' : '✗';
    text.textContent = message;
    
    notification.className = `notification ${type} active`;

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
