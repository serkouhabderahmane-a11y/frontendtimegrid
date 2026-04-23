<template>
  <div class="onboarding-portal">
    <header class="portal-header">
      <div class="header-content">
        <h1>Welcome to TimeGrid</h1>
        <p>Complete your onboarding checklist to get started</p>
      </div>
      <div class="progress-section">
        <div class="progress-label">
          <span>Progress</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </header>

    <div class="portal-content">
      <aside class="task-sidebar">
        <h3>Your Tasks</h3>
        <div class="task-list">
          <div 
            v-for="(taskStatus, index) in taskStatuses" 
            :key="taskStatus.taskId"
            class="task-item"
            :class="{ 
              active: currentTask?.taskId === taskStatus.taskId,
              completed: taskStatus.status === 'approved',
              locked: !canAccessTask(index)
            }"
            @click="selectTask(index)"
          >
            <div class="task-icon">
              <span v-if="taskStatus.status === 'approved'" class="check">✓</span>
              <span v-else-if="taskStatus.status === 'rejected'" class="rejected">!</span>
              <span v-else-if="!canAccessTask(index)" class="lock">🔒</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="task-info">
              <span class="task-name">{{ taskStatus.task?.name }}</span>
              <span class="task-status-text">{{ formatStatus(taskStatus.status) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="task-content">
        <div v-if="!currentTask" class="welcome-screen">
          <div class="welcome-card">
            <h2>👋 Welcome, {{ onboarding?.candidate?.firstName }}!</h2>
            <p>We're excited to have you join our team. Please complete all required tasks to get started.</p>
            <div class="requirements">
              <h3>What you need to complete:</h3>
              <ul>
                <li v-for="task in requiredTasks" :key="task.taskId">
                  {{ task.task?.name }} ({{ task.task?.isRequired ? 'Required' : 'Optional' }})
                </li>
              </ul>
            </div>
            <button @click="selectTask(0)" class="btn-start">Start Onboarding</button>
          </div>
        </div>

        <div v-else class="task-detail">
          <div class="task-header">
            <h2>{{ currentTask.task?.name }}</h2>
            <p>{{ currentTask.task?.description }}</p>
            <span class="task-type-badge">{{ formatTaskType(currentTask.task?.type) }}</span>
          </div>

          <div v-if="currentTask.status === 'approved'" class="completed-message">
            <span class="check-icon">✓</span>
            <p>This task has been approved</p>
          </div>

          <div v-else-if="currentTask.status === 'rejected'" class="rejected-message">
            <span class="warning-icon">!</span>
            <p>This task was rejected</p>
            <p class="comment">Reason: {{ currentTask.reviewComment || 'No reason provided' }}</p>
            <button @click="currentTask.status = 'draft'" class="btn-retry">Fix & Resubmit</button>
          </div>

          <form v-else @submit.prevent="submitTask" class="task-form">
            <!-- Personal Information -->
            <div v-if="currentTask.task?.type === 'personal_info'" class="form-section">
              <h3>Personal Information</h3>
              <p class="form-info">The following information was provided by your employer. Please verify and complete any missing details.</p>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Legal First Name *</label>
                  <input v-model="formData.firstName" type="text" required />
                </div>
                <div class="form-group">
                  <label>Legal Last Name *</label>
                  <input v-model="formData.lastName" type="text" required />
                </div>
              </div>
              <div class="form-group">
                <label>Date of Birth *</label>
                <DatePicker v-model="formData.dateOfBirth" placeholder="Select date of birth" />
              </div>
              <div class="form-group">
                <label>Address *</label>
                <input v-model="formData.address" type="text" placeholder="Street Address" required />
                <input v-model="formData.city" type="text" placeholder="City" required class="mt-2" />
                <div class="form-row mt-2">
                  <input v-model="formData.state" type="text" placeholder="State" required />
                  <input v-model="formData.zipCode" type="text" placeholder="ZIP Code" required />
                </div>
              </div>
              <div class="form-group">
                <label>Emergency Contact Name *</label>
                <input v-model="formData.emergencyName" type="text" required />
              </div>
              <div class="form-group">
                <label>Emergency Contact Phone *</label>
                <input v-model="formData.emergencyPhone" type="tel" required />
              </div>
              <div class="form-group">
                <label>Social Security Number (Optional)</label>
                <input v-model="formData.ssn" type="text" placeholder="XXX-XX-XXXX" />
                <small>Only required if mandatory in your jurisdiction</small>
              </div>
            </div>

            <!-- Offer Letter -->
            <div v-if="currentTask.task?.type === 'offer_letter'" class="form-section">
              <div class="form-info" style="background: #fff3cd; border: 1px solid #ffc107;">
                <strong>Important:</strong> Your offer letter must be signed before continuing with other onboarding tasks.
              </div>
              
              <h3>Offer Letter</h3>
              <p class="form-desc">Please review your offer letter carefully and sign to confirm your acceptance.</p>
              
              <!-- Document Preview -->
              <div class="document-preview">
                <div class="doc-header">
                  <h4>{{ offerLetterData?.title || 'Employment Offer Letter' }}</h4>
                  <span class="doc-version">Version {{ offerLetterData?.version || '1.0' }}</span>
                </div>
                <div class="doc-content offer-letter-content">
                  <p v-if="offerLetterData?.content">
                    {{ offerLetterData.content }}
                  </p>
                  <p v-else>
                    <strong>Dear {{ onboarding?.candidate?.firstName || 'Candidate' }},</strong><br/><br/>
                    We are pleased to offer you the position of <strong>{{ onboarding?.candidate?.position || 'Position Title' }}</strong> 
                    at <strong>TimeGrid</strong>.<br/><br/>
                    <strong>Start Date:</strong> {{ onboarding?.candidate?.startDate || 'To be determined' }}<br/>
                    <strong>Employment Type:</strong> {{ onboarding?.candidate?.employmentType || 'Full-time' }}<br/>
                    <strong>Location:</strong> {{ onboarding?.candidate?.location || 'To be assigned' }}<br/><br/>
                    This offer is contingent upon successful completion of background verification and onboarding requirements.<br/><br/>
                    Please review and sign below to accept this offer.
                  </p>
                </div>
              </div>

              <!-- Electronic Signature -->
              <div class="form-group signature-section">
                <label>Electronic Signature *</label>
                <p class="signature-instruction">Type your full legal name to sign the offer letter</p>
                <div class="typed-signature-wrapper">
                  <input 
                    v-model="formData.offerLetterTypedSignature" 
                    type="text"
                    class="typed-signature-input"
                    placeholder="Type your full legal name here"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="words"
                    spellcheck="false"
                  />
                  
                </div>
                <div class="attestation-checkbox">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="formData.offerLetterAttestationConfirmed"
                    />
                    <span>I confirm that typing my name constitutes my legal electronic signature for the Offer Letter</span>
                  </label>
                </div>
                <p class="legal-text">
                  <strong>Note:</strong> Your typed name is your electronic signature. No finger drawing or canvas signature is used.
                </p>
              </div>

              <!-- Acknowledgement Checkboxes -->
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.offerLetterRead" type="checkbox" required />
                  <span>I have read and understood the offer letter *</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.offerLetterAccepted" type="checkbox" required />
                  <span>I accept the terms and conditions of employment as outlined in the offer letter *</span>
                </label>
              </div>
            </div>

            <!-- Government Forms -->
            <div v-if="currentTask.task?.type === 'government_forms'" class="form-section">
              <h3>Government Tax Forms</h3>
              
              <!-- Form Status Indicator -->
              <div class="gov-forms-status-bar">
                <div v-if="govFormsStatus === 'submitted'" class="status-submitted">
                  <span class="status-icon">✓</span>
                  <span class="status-text">Form Submitted – Read Only</span>
                  <span class="status-detail">Submitted {{ govFormsDraftSaved || 'previously' }}</span>
                </div>
                <div v-else-if="govFormsStatus === 'draft'" class="status-draft">
                  <span v-if="govFormsSaving" class="status-saving">
                    <span class="saving-spinner"></span>
                    <span>Saving...</span>
                  </span>
                  <span v-else class="status-saved">
                    <span class="status-icon">💾</span>
                    <span class="status-text">Draft Saved</span>
                    <span v-if="govFormsLastSaved" class="status-detail">Last saved: {{ formatSavedTime(govFormsLastSaved) }}</span>
                  </span>
                </div>
                <div v-else class="status-empty">
                  <span class="status-text">Complete all required fields</span>
                </div>
              </div>
              
              <!-- Read-only notice for submitted forms -->
              <div v-if="govFormsStatus === 'submitted'" class="submitted-notice">
                <strong>Note:</strong> This form has been submitted and cannot be modified. HR will review your submission.
              </div>
              
              <div class="form-group" :class="{ 'readonly-mode': govFormsStatus === 'submitted' }">
                <label>Form W-4 - Employee's Withholding Certificate</label>
                <div class="form-subsection">
                  <p class="form-desc">Federal tax withholding form</p>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Filing Status *</label>
                      <select v-model="formData.w4FilingStatus" @change="scheduleGovFormsAutoSave" :disabled="govFormsStatus === 'submitted'" required>
                        <option value="">Select...</option>
                        <option value="single">Single or Married filing separately</option>
                        <option value="married">Married filing jointly</option>
                        <option value="head">Head of household</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Total Dependents *</label>
                      <input v-model="formData.w4Dependents" @input="scheduleGovFormsAutoSave" type="number" min="0" :disabled="govFormsStatus === 'submitted'" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Other Income</label>
                      <input v-model="formData.w4OtherIncome" @input="scheduleGovFormsAutoSave" type="number" min="0" :disabled="govFormsStatus === 'submitted'" />
                    </div>
                    <div class="form-group">
                      <label>Deductions</label>
                      <input v-model="formData.w4Deductions" @input="scheduleGovFormsAutoSave" type="number" min="0" :disabled="govFormsStatus === 'submitted'" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Extra Withholding</label>
                    <input v-model="formData.w4ExtraWithholding" @input="scheduleGovFormsAutoSave" type="number" min="0" :disabled="govFormsStatus === 'submitted'" />
                  </div>
                  
                  <!-- W-4 Electronic Signature (Typed Name Only) -->
                  <div class="form-group signature-section">
                    <label>Electronic Signature *</label>
                    <p class="signature-instruction">Type your name to sign</p>
                    <div class="typed-signature-wrapper">
                      <input 
                        v-model="formData.w4TypedSignature" 
                        @input="scheduleGovFormsAutoSave"
                        type="text"
                        class="typed-signature-input"
                        :class="{ 'signature-verified': formData.w4TypedSignature && isNameMatch(formData.w4TypedSignature) }"
                        placeholder="Type your name here"
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="words"
                        spellcheck="false"
                        :disabled="govFormsStatus === 'submitted'"
                      />
                    </div>
                    <div class="attestation-checkbox">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          v-model="formData.w4AttestationConfirmed"
                          @change="scheduleGovFormsAutoSave"
                          :disabled="govFormsStatus === 'submitted'"
                        />
                        <span>I confirm that typing my name constitutes my legal electronic signature for Form W-4</span>
                      </label>
                    </div>
                    <p class="legal-text">
                      <strong>Note:</strong> Your typed name is your electronic signature. No finger drawing or canvas signature is used.
                    </p>
                  </div>
                </div>
              </div>

              <div class="form-group mt-4" :class="{ 'readonly-mode': govFormsStatus === 'submitted' }">
                <label>I-9 - Employment Eligibility Verification</label>
                <div class="form-subsection">
                  <p class="form-desc">Proof of identity and employment authorization</p>
                  <div class="form-group">
                    <label>Document Type *</label>
                    <select v-model="formData.i9DocType" @change="scheduleGovFormsAutoSave" :disabled="govFormsStatus === 'submitted'" required>
                      <option value="">Select...</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="ssn">SSN Card</option>
                      <option value="work_permit">Employment Authorization Card</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Document Number *</label>
                      <input v-model="formData.i9DocNumber" @input="scheduleGovFormsAutoSave" type="text" :disabled="govFormsStatus === 'submitted'" required />
                    </div>
                      <div class="form-group">
                        <label>Expiration Date (if any)</label>
                        <DatePicker v-model="formData.i9Expiration" @update:modelValue="scheduleGovFormsAutoSave" :placeholder="govFormsStatus === 'submitted' ? '' : 'Select expiration date'" :disabled="govFormsStatus === 'submitted'" />
                      </div>
                  </div>
                  <div class="form-group">
                    <label>Citizenship/Immigration Status *</label>
                    <select v-model="formData.i9Status" @change="scheduleGovFormsAutoSave" :disabled="govFormsStatus === 'submitted'" required>
                      <option value="">Select...</option>
                      <option value="citizen">U.S. Citizen</option>
                      <option value="permanent_resident">Permanent Resident</option>
                      <option value="work_auth">Work Authorized</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Upload ID Document (PDF) *</label>
                    <div class="file-upload" :class="{ 'upload-disabled': govFormsStatus === 'submitted' }">
                      <input type="file" @change="handleI9FileUpload" accept=".pdf" :disabled="govFormsStatus === 'submitted'" />
                      <div class="upload-icon">📄</div>
                      <p>Click to upload ID document</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.i9UploadedFile" class="file-preview">
                      <span class="file-name">📄 {{ formData.i9UploadedFile }}</span>
                      <span v-if="govFormsStatus !== 'submitted'" class="file-remove" @click="formData.i9UploadedFile = null; formData.i9UploadedFileData = null">×</span>
                    </div>
                  </div>
                  
                  <!-- I-9 Electronic Signature (Typed Name Only) -->
                  <div class="form-group signature-section">
                    <label>Electronic Signature *</label>
                    <p class="signature-instruction">Type your full legal name exactly as shown above</p>
                    <div class="typed-signature-wrapper">
                      <input 
                        v-model="formData.i9TypedSignature" 
                        @input="scheduleGovFormsAutoSave"
                        type="text"
                        class="typed-signature-input"
                        :class="{ 'signature-verified': formData.i9TypedSignature && isNameMatch(formData.i9TypedSignature) }"
                        placeholder="Type your name here"
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="words"
                        spellcheck="false"
                        :disabled="govFormsStatus === 'submitted'"
                      />
                    </div>
                    <div class="attestation-checkbox">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          v-model="formData.i9AttestationConfirmed"
                          @change="scheduleGovFormsAutoSave"
                          :disabled="govFormsStatus === 'submitted'"
                        />
                        <span>I confirm that typing my name constitutes my legal electronic signature for Form I-9</span>
                      </label>
                    </div>
                    <p class="legal-text">
                      <strong>Note:</strong> Your typed name is your electronic signature. No finger drawing or canvas signature is used.
                    </p>
                  </div>
                </div>
              </div>
            </div>

              <!-- Document Upload -->
            <div v-if="currentTask.task?.type === 'document_upload'" class="form-section">
              <div class="form-info" style="background: #e8f5e9; border: 1px solid #4caf50;">
                <strong>All document uploads are optional.</strong> You may skip this step if you don't have documents to upload. The onboarding will continue without blocking.
              </div>
              
              <h3>Document Upload</h3>
              <p class="form-desc">Upload any supporting documents such as government ID, certifications, or licenses. All uploads are optional.</p>
              
              <div class="optional-docs-list">
                <div class="optional-doc-item">
                  <div class="doc-type-header">
                    <span class="doc-type-label">Government ID</span>
                    <span class="optional-badge">Optional</span>
                  </div>
                  <div class="form-group">
                    <div class="file-upload optional-upload">
                      <input type="file" @change="handleFileUpload($event, 'government_id')" accept=".pdf" />
                      <div class="upload-icon">📄</div>
                      <p>Upload Government ID (PDF)</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.governmentIdFile" class="file-preview">
                      <span class="file-name">{{ formData.governmentIdFile }}</span>
                      <span class="file-remove" @click="formData.governmentIdFile = null; formData.governmentIdFileData = null">×</span>
                    </div>
                  </div>
                </div>

                <div class="optional-doc-item">
                  <div class="doc-type-header">
                    <span class="doc-type-label">Driver's License</span>
                    <span class="optional-badge">Optional</span>
                  </div>
                  <div class="form-group">
                    <div class="file-upload optional-upload">
                      <input type="file" @change="handleFileUpload($event, 'drivers_license')" accept=".pdf" />
                      <div class="upload-icon">📄</div>
                      <p>Upload Driver's License (PDF)</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.driversLicenseFile" class="file-preview">
                      <span class="file-name">{{ formData.driversLicenseFile }}</span>
                      <span class="file-remove" @click="formData.driversLicenseFile = null; formData.driversLicenseFileData = null">×</span>
                    </div>
                  </div>
                </div>

                <div class="optional-doc-item">
                  <div class="doc-type-header">
                    <span class="doc-type-label">Professional Certification</span>
                    <span class="optional-badge">Optional</span>
                  </div>
                  <div class="form-group">
                    <div class="file-upload optional-upload">
                      <input type="file" @change="handleFileUpload($event, 'certification')" accept=".pdf" />
                      <div class="upload-icon">📄</div>
                      <p>Upload Certification (PDF)</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.certificationFile" class="file-preview">
                      <span class="file-name">{{ formData.certificationFile }}</span>
                      <span class="file-remove" @click="formData.certificationFile = null; formData.certificationFileData = null">×</span>
                    </div>
                  </div>
                </div>

                <div class="optional-doc-item">
                  <div class="doc-type-header">
                    <span class="doc-type-label">Education Diploma</span>
                    <span class="optional-badge">Optional</span>
                  </div>
                  <div class="form-group">
                    <div class="file-upload optional-upload">
                      <input type="file" @change="handleFileUpload($event, 'education')" accept=".pdf" />
                      <div class="upload-icon">📄</div>
                      <p>Upload Education Diploma (PDF)</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.educationFile" class="file-preview">
                      <span class="file-name">{{ formData.educationFile }}</span>
                      <span class="file-remove" @click="formData.educationFile = null; formData.educationFileData = null">×</span>
                    </div>
                  </div>
                </div>

                <div class="optional-doc-item">
                  <div class="doc-type-header">
                    <span class="doc-type-label">Other Documents</span>
                    <span class="optional-badge">Optional</span>
                  </div>
                  <div class="form-group">
                    <div class="file-upload optional-upload">
                      <input type="file" @change="handleFileUpload($event, 'other')" accept=".pdf" />
                      <div class="upload-icon">📄</div>
                      <p>Upload Other Document (PDF)</p>
                      <small>PDF only (max 10MB)</small>
                    </div>
                    <div v-if="formData.otherFile" class="file-preview">
                      <span class="file-name">{{ formData.otherFile }}</span>
                      <span class="file-remove" @click="formData.otherFile = null; formData.otherFileData = null">×</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Uploads Summary -->
              <div v-if="hasOptionalUploads" class="uploads-summary">
                <h4>Uploaded Documents ({{ uploadedDocumentsCount }})</h4>
                <ul>
                  <li v-if="formData.governmentIdFile">Government ID: {{ formData.governmentIdFile }}</li>
                  <li v-if="formData.driversLicenseFile">Driver's License: {{ formData.driversLicenseFile }}</li>
                  <li v-if="formData.certificationFile">Certification: {{ formData.certificationFile }}</li>
                  <li v-if="formData.educationFile">Education: {{ formData.educationFile }}</li>
                  <li v-if="formData.otherFile">Other: {{ formData.otherFile }}</li>
                </ul>
              </div>
            </div>

            <!-- Policy Acknowledgement -->
            <div v-if="currentTask.task?.type === 'policy_acknowledgment'" class="form-section">
              <h3>Policy Acknowledgement</h3>
              <div class="policy-content">
                <h4>Employee Handbook</h4>
                <div class="policy-text">
                  <h5>1. Company Mission and Values</h5>
                  <p>Our company is committed to excellence, integrity, and innovation. We strive to create a positive work environment where every employee can thrive.</p>
                  
                  <h5>2. Code of Conduct</h5>
                  <p>All employees are expected to maintain professional conduct, respect colleagues, and adhere to company policies at all times.</p>
                  
                  <h5>3. Confidentiality</h5>
                  <p>Employees must protect confidential company information, including trade secrets, customer data, and proprietary business information.</p>
                  
                  <h5>4. Data Security</h5>
                  <p>All employees must follow security protocols to protect company and customer data from unauthorized access or disclosure.</p>
                  
                  <h5>5. Anti-Harassment Policy</h5>
                  <p>Our company maintains a zero-tolerance policy for harassment of any kind. All employees have the right to work in a harassment-free environment.</p>
                  
                  <h5>6. Attendance and Time Off</h5>
                  <p>Employees are expected to maintain regular attendance. All time off must be requested in advance and approved by your supervisor.</p>
                </div>
                <div class="scroll-indicator" ref="policyScroll" @scroll="checkScroll">
                  <div class="scroll-fake" :style="{ height: policyContentHeight + 'px' }"></div>
                </div>
              </div>
              <div class="form-group mt-4">
                <label class="checkbox-label">
                  <input v-model="formData.policyAccepted" type="checkbox" required />
                  <span>I have read and understand the company policies outlined above *</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.policyAgreed" type="checkbox" required />
                  <span>I agree to comply with all company policies and understand that violations may result in disciplinary action *</span>
                </label>
              </div>
              <div class="signature-field">
                <label>Electronic Signature *</label>
                <input v-model="formData.policySignature" type="text" placeholder="Type your full legal name" required />
                <p class="signature-date">Date: {{ new Date().toLocaleDateString() }} | IP: {{ userIP }}</p>
              </div>
            </div>

            <!-- Training Acknowledgement with Video Requirement -->
            <div v-if="currentTask.task?.type === 'training_acknowledgment'" class="form-section">
              <h3>Training Acknowledgement</h3>
              <p class="form-desc">Complete the required training videos and acknowledge completion</p>
              
              <!-- Loading State -->
              <div v-if="trainingLoading" class="training-loading">
                <div class="spinner"></div>
                <p>Loading training videos...</p>
              </div>
              
              <!-- Error State -->
              <div v-else-if="trainingError" class="training-error">
                <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>{{ trainingError }}</p>
                <button @click="fetchTrainingVideos(currentTask.taskId)" class="btn-retry">Retry</button>
              </div>
              
              <!-- No Videos State -->
              <div v-else-if="trainingVideos.length === 0" class="training-empty">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <p>No training videos assigned</p>
                <small>Contact HR if you believe this is an error.</small>
              </div>
              
              <!-- Training Content -->
              <template v-else>
                <!-- Training Progress Summary -->
                <div class="training-progress-summary">
                  <div class="progress-header">
                    <span>Your Progress</span>
                    <span>{{ completedVideosCount }} / {{ requiredVideosCount }} required videos</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: trainingProgressPercent + '%' }"></div>
                  </div>
                  <div v-if="allRequiredVideosCompleted" class="progress-ready">
                    ✓ All required videos completed. You can now acknowledge the training.
                  </div>
                  <div v-else class="progress-waiting">
                    Complete all required videos (*) to unlock acknowledgement.
                  </div>
                </div>

                <!-- Video List -->
                <div class="video-list">
                  <div v-for="(video, idx) in trainingVideos" :key="video.id" class="video-item" :class="{ 'video-active': idx === currentVideoIndex }">
                    <div class="video-thumbnail" @click="selectTrainingVideo(idx)">
                      <span v-if="video.progress?.is_completed" class="thumbnail-check">✓</span>
                      <span v-else-if="idx === currentVideoIndex && videoPlaying" class="thumbnail-play playing">▶</span>
                      <span v-else class="thumbnail-play">▶</span>
                    </div>
                    <div class="video-info">
                      <div class="video-title" @click="selectTrainingVideo(idx)">
                        {{ idx + 1 }}. {{ video.title }}
                        <span v-if="video.is_required" class="required-badge">*</span>
                      </div>
                      <div class="video-duration">Duration: {{ formatVideoTime(video.duration_seconds) }}</div>
                      <div class="video-progress-bar">
                        <div class="video-progress-fill" 
                          :style="{ width: (video.progress?.completion_percentage || 0) + '%' }"
                          :class="{ 'progress-complete': video.progress?.is_completed }"></div>
                      </div>
                      <div class="video-status">
                        {{ video.progress?.is_completed ? '✓ Completed' : 
                           (video.progress?.completion_percentage > 0 ? (video.progress?.completion_percentage || 0) + '% complete' : 'Not started') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Current Video Player -->
                <div v-if="currentTrainingVideo" class="current-video">
                  <div class="now-playing">Now Playing</div>
                  <div class="video-name">{{ currentTrainingVideo.title }}</div>
                  <div v-if="currentTrainingVideo.description" class="video-description">
                    {{ currentTrainingVideo.description }}
                  </div>
                  
                  <!-- Self-Hosted Video Player (HTML5) -->
                  <div v-if="isSelfHostedVideo(currentTrainingVideo)" class="video-player">
                    <video 
                      ref="videoElement"
                      :src="getVideoSource(currentTrainingVideo)"
                      :poster="currentTrainingVideo.thumbnail_url"
                      @loadedmetadata="onVideoLoaded"
                      @timeupdate="onVideoTimeUpdate"
                      @play="onVideoPlay"
                      @pause="onVideoPause"
                      @ended="onVideoEnded"
                      @seeking="onVideoSeeking"
                      controls
                      preload="metadata"
                      class="html5-video-player"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <!-- External/Embed Video Player (Fallback) -->
                  <div v-else class="video-player">
                    <div class="player-overlay">
                      <div class="player-placeholder" :class="{ 'video-completed': currentTrainingVideo.progress?.is_completed }">
                        <div v-if="currentTrainingVideo.progress?.is_completed" class="completed-overlay">
                          <span class="check-big">✓</span>
                          <p>Video Completed</p>
                        </div>
                        <div v-else class="video-controls">
                          <button @click="toggleVideoPlayback" class="play-btn" :class="{ playing: videoPlaying }">
                            {{ videoPlaying ? '⏸' : '▶' }}
                          </button>
                          <p class="player-text">{{ videoPlaying ? 'Playing...' : 'Click to Watch' }}</p>
                          <p class="player-subtext">Progress will be saved automatically</p>
                        </div>
                      </div>
                    </div>
                    <div class="video-progress-overlay">
                      <div class="progress-track">
                        <div class="progress-indicator" 
                          :style="{ width: (currentTrainingVideo.progress?.completion_percentage || 0) + '%' }"
                          :class="{ 'indicator-complete': currentTrainingVideo.progress?.is_completed }"></div>
                      </div>
                      <div class="progress-info">
                        <span>{{ currentTrainingVideo.progress?.completion_percentage || 0 }}% watched</span>
                        <span>{{ formatVideoTime(currentTrainingVideo.progress?.watched_seconds || 0) }} / {{ formatVideoTime(currentTrainingVideo.duration_seconds) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Video Progress Bar -->
                  <div class="video-progress-bar-external">
                    <div class="progress-track">
                      <div class="progress-indicator" 
                        :style="{ width: (currentTrainingVideo.progress?.completion_percentage || 0) + '%' }"
                        :class="{ 'indicator-complete': currentTrainingVideo.progress?.is_completed }"></div>
                    </div>
                    <div class="progress-info">
                      <span>{{ currentTrainingVideo.progress?.completion_percentage || 0 }}% watched</span>
                      <span>{{ formatVideoTime(currentTrainingVideo.progress?.watched_seconds || 0) }} / {{ formatVideoTime(currentTrainingVideo.duration_seconds) }}</span>
                    </div>
                  </div>

                  <div v-if="currentTrainingVideo.is_required" class="video-required-notice">
                    {{ currentTrainingVideo.progress?.is_completed 
                      ? '✓ This required video is complete' 
                      : `You must watch ${currentTrainingVideo.completion_threshold || 95}% of this video to complete` }}
                  </div>

                  <div v-if="currentTrainingVideo.progress?.is_completed" class="video-completed-badge">
                    ✓ Video Completed
                  </div>

                  <!-- Anti-cheat notice -->
                  <div class="anticheat-notice">
                    <strong>Note:</strong> Completion requires watching at least {{ currentTrainingVideo.completion_threshold || 95 }}% of the video. Progress is automatically saved.
                  </div>
                </div>
              </template>

              <!-- Acknowledge Section -->
              <div class="acknowledge-section" :class="{ 'ready': allRequiredVideosCompleted }">
                <div class="signature-field">
                  <label>Acknowledge Completion *</label>
                  <input 
                    v-model="formData.trainingSignature" 
                    type="text" 
                    placeholder="Type your full legal name to acknowledge" 
                    :disabled="!allRequiredVideosCompleted"
                    required 
                  />
                  <p class="signature-date">Date: {{ new Date().toLocaleDateString() }} | IP: {{ userIP }}</p>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input v-model="formData.trainingAccepted" type="checkbox" :disabled="!allRequiredVideosCompleted" required />
                    <span>I confirm that I have completed all required training videos *</span>
                  </label>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input v-model="formData.trainingAgreed" type="checkbox" :disabled="!allRequiredVideosCompleted" required />
                    <span>I understand the training materials and agree to comply with company policies *</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- E-Signature -->
            <div v-if="currentTask.task?.type === 'e_signature'" class="form-section">
              <h3>E-Signature</h3>
              
              <div class="form-group">
                <label>Select Document to Sign *</label>
                <select v-model="formData.signDocType" required>
                  <option value="">Select...</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="nda">Non-Disclosure Agreement (NDA)</option>
                  <option value="job_description">Job Description</option>
                  <option value="arbitration">Arbitration Agreement</option>
                </select>
              </div>

              <div v-if="formData.signDocType" class="document-preview">
                <div class="doc-header">
                  <h4>{{ getDocTitle(formData.signDocType) }}</h4>
                </div>
                <div class="doc-content">
                  <p v-if="formData.signDocType === 'offer_letter'">
                    <strong>OFFER LETTER</strong><br/>
                    Dear {{ onboarding?.candidate?.firstName }},<br/><br/>
                    We are pleased to offer you the position of {{ onboarding?.candidate?.position }} at TimeGrid.<br/><br/>
                    Your start date will be {{ onboarding?.candidate?.startDate || 'to be determined' }}.<br/><br/>
                    This offer is contingent upon successful completion of background check and onboarding requirements.
                  </p>
                  <p v-else-if="formData.signDocType === 'nda'">
                    <strong>NON-DISCLOSURE AGREEMENT</strong><br/><br/>
                    In consideration of employment, you agree to maintain confidentiality of all proprietary information.
                  </p>
                  <p v-else-if="formData.signDocType === 'job_description'">
                    <strong>JOB DESCRIPTION</strong><br/><br/>
                    Position: {{ onboarding?.candidate?.position }}<br/>
                    Reports to: Department Manager<br/>
                    Location: Corporate Office
                  </p>
                  <p v-else>
                    <strong>ARBITRATION AGREEMENT</strong><br/><br/>
                    You agree that any disputes will be resolved through binding arbitration.
                  </p>
                </div>
              </div>

              <div class="form-group signature-section">
                <label>Electronic Signature *</label>
                <p class="signature-instruction">Type your name to sign</p>
                <div class="typed-signature-wrapper">
                  <input 
                    v-model="formData.typedSignature" 
                    type="text"
                    class="typed-signature-input"
                    placeholder="Type your name here"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="words"
                    spellcheck="false"
                  />
                 
                </div>
                <div class="attestation-checkbox">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="formData.attestationConfirmed"
                    />
                    <span>I confirm that typing my name constitutes my legal electronic signature</span>
                  </label>
                </div>
                <p class="legal-text">
                  <strong>Note:</strong> Your typed name is your electronic signature. No finger drawing or canvas signature is used.
                </p>
              </div>
            </div>

            <!-- Role Confirmation -->
            <div v-if="currentTask.task?.type === 'role_confirmation'" class="form-section">
              <h3>Role Confirmation</h3>
              <p class="form-desc">Please review and confirm your role details</p>

              <div class="role-details">
                <div class="detail-row">
                  <span class="label">Job Title:</span>
                  <span class="value">{{ onboarding?.candidate?.position }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Start Date:</span>
                  <span class="value">{{ onboarding?.candidate?.startDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Employment Type:</span>
                  <span class="value">{{ onboarding?.candidate?.employmentType }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Department:</span>
                  <span class="value">To be assigned</span>
                </div>
              </div>

              <div class="form-group mt-4">
                <label class="checkbox-label">
                  <input v-model="formData.roleConfirmed" type="checkbox" required />
                  <span>I confirm that the information above is accurate *</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input v-model="formData.roleUnderstood" type="checkbox" required />
                  <span>I understand my responsibilities and agree to the terms of employment *</span>
                </label>
              </div>
              <div class="signature-field">
                <label>Electronic Signature *</label>
                <input v-model="formData.roleSignature" type="text" placeholder="Type your full legal name" required />
                <p class="signature-date">Date: {{ new Date().toLocaleDateString() }}</p>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" :disabled="submitting">
                {{ submitting ? 'Submitting...' : 'Submit Task' }}
              </button>
            </div>
          </form>

          <!-- Confirmation Modal -->
          <Transition name="modal">
            <div v-if="showConfirmation" class="confirmation-overlay" @click.self="closeConfirmation">
              <div class="confirmation-content">
                <div class="success-icon">✓</div>
                <h2>Task Submitted!</h2>
                <p>Your <strong>{{ submittedTask }}</strong> has been submitted for review.</p>
                <p class="next-step">You will be notified once it's approved. You can continue with other tasks below.</p>
                <button @click="closeConfirmation" class="btn-continue">Continue</button>
              </div>
            </div>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api/axios'
import DatePicker from '../../components/DatePicker.vue'

const route = useRoute()
const token = route.params.token

const onboarding = ref(null)
const taskStatuses = ref([])
const currentTaskIndex = ref(0)
const submitting = ref(false)
const policyScroll = ref(null)
const policyContentHeight = ref(0)
const showConfirmation = ref(false)
const submittedTask = ref(null)

// Audit logging
const auditLog = []

const logAuditEvent = (action, details = {}) => {
  const event = {
    timestamp: new Date().toISOString(),
    action,
    taskId: currentTask.value?.taskId,
    taskType: currentTask.value?.task?.type,
    ...details
  }
  auditLog.push(event)
  console.log('[Audit]', event)
}

// Typed signature refs
const typedSignature = ref('')
const w4TypedSignature = ref('')
const i9TypedSignature = ref('')

// Offer letter data
const offerLetterData = ref(null)

const userIP = ref('192.168.1.1')

const formData = ref({})

// Training video state
const trainingVideos = ref([])
const currentVideoIndex = ref(0)
const trainingLoading = ref(false)
const trainingError = ref(null)
const videoPlaying = ref(false)
const videoSimInterval = ref(null)
const hasLoadedVideos = ref(false)

// Progress storage key
const TRAINING_PROGRESS_KEY = 'onboarding_training_progress'

// Government Forms State
const govFormsStatus = ref('empty') // 'empty' | 'draft' | 'submitted'
const govFormsDraftSaved = ref(null)
const govFormsSaving = ref(false)
const govFormsVersion = ref('1.0')
const govFormsLastSaved = ref(null)
let govFormsAutoSaveTimer = null

const currentTrainingVideo = computed(() => {
  return trainingVideos.value[currentVideoIndex.value] || null
})

const completedVideosCount = computed(() => {
  return trainingVideos.value.filter(v => v.is_required && v.progress?.is_completed).length
})

const requiredVideosCount = computed(() => {
  return trainingVideos.value.filter(v => v.is_required).length
})

const trainingProgressPercent = computed(() => {
  if (requiredVideosCount.value === 0) return 0
  return Math.round((completedVideosCount.value / requiredVideosCount.value) * 100)
})

const allRequiredVideosCompleted = computed(() => {
  return requiredVideosCount.value > 0 && completedVideosCount.value >= requiredVideosCount.value
})

const hasOptionalUploads = computed(() => {
  return formData.value.governmentIdFile || 
         formData.value.driversLicenseFile || 
         formData.value.certificationFile || 
         formData.value.educationFile || 
         formData.value.otherFile
})

const uploadedDocumentsCount = computed(() => {
  let count = 0
  if (formData.value.governmentIdFile) count++
  if (formData.value.driversLicenseFile) count++
  if (formData.value.certificationFile) count++
  if (formData.value.educationFile) count++
  if (formData.value.otherFile) count++
  return count
})

const formatVideoTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const videoElement = ref(null)

// Check if video is self-hosted (uploaded to TimeGrid)
const isSelfHostedVideo = (video) => {
  if (!video) return false
  if (video.video_source === 'uploaded' || video.video_source === 'stream') return true
  if (video.video_url?.startsWith('/api/videos') || video.video_url?.startsWith('local:')) return true
  if (video.video_url?.includes('youtube.com') || video.video_url?.includes('vimeo.com')) return false
  if (video.video_url?.startsWith('http')) return false
  return false
}

// Get video source URL for HTML5 player
const getVideoSource = (video) => {
  if (!video) return ''
  if (video.video_url?.startsWith('/api/videos')) {
    return video.video_url
  }
  if (video.video_url?.startsWith('local:')) {
    const parts = video.video_url.split(':')[1]?.split('/')
    if (parts?.length >= 2) {
      return `/api/videos/stream/${parts[0]}/${parts[1]}`
    }
  }
  return video.video_url || ''
}

// HTML5 Video event handlers - THESE DO NOT NAVIGATE
const onVideoLoaded = (event) => {
  const video = event.target
  if (video && currentTrainingVideo.value) {
    const duration = Math.floor(video.duration)
    if (duration > 0 && currentTrainingVideo.value.duration_seconds !== duration) {
      currentTrainingVideo.value.duration_seconds = duration
    }
    const lastPosition = currentTrainingVideo.value.progress?.last_position_seconds || 0
    if (lastPosition > 0 && lastPosition < video.duration - 5) {
      video.currentTime = lastPosition
    }
    logAuditEvent('VIDEO_LOADED', { videoId: currentTrainingVideo.value.id })
  }
}

const onVideoTimeUpdate = (event) => {
  const video = event.target
  if (!video || !currentTrainingVideo.value) return
  
  const currentTime = Math.floor(video.currentTime)
  const duration = Math.floor(video.duration)
  const watchedSeconds = currentTrainingVideo.value.progress?.watched_seconds || 0
  
  if (currentTime > watchedSeconds) {
    const completionPct = duration > 0 ? Math.round((currentTime / duration) * 100) : 0
    updateVideoProgress(currentTrainingVideo.value.id, currentTime, currentTime, completionPct)
  }
}

const onVideoPlay = () => {
  videoPlaying.value = true
  logAuditEvent('VIDEO_STARTED', { videoId: currentTrainingVideo.value?.id })
}

const onVideoPause = () => {
  videoPlaying.value = false
  logAuditEvent('VIDEO_PAUSED', { videoId: currentTrainingVideo.value?.id })
}

const onVideoEnded = () => {
  videoPlaying.value = false
  if (currentTrainingVideo.value) {
    const duration = Math.floor(videoElement.value?.duration || currentTrainingVideo.value.duration_seconds)
    const completionPct = 100
    updateVideoProgress(currentTrainingVideo.value.id, duration, duration, completionPct)
    logAuditEvent('VIDEO_COMPLETED', { 
      videoId: currentTrainingVideo.value.id,
      duration
    })
  }
}

const onVideoSeeking = () => {
  logAuditEvent('VIDEO_SEEKING', { 
    position: videoElement.value?.currentTime 
  })
}

const loadTrainingProgress = () => {
  try {
    const saved = localStorage.getItem(TRAINING_PROGRESS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return {}
}

const saveTrainingProgress = (progress) => {
  try {
    localStorage.setItem(TRAINING_PROGRESS_KEY, JSON.stringify(progress))
  } catch (e) {}
}

const updateVideoProgress = async (videoId, currentPosition, watchedDuration, completionPct) => {
  const progress = loadTrainingProgress()
  const video = trainingVideos.value.find(v => v.id === videoId)
  
  if (video) {
    const threshold = video.completion_threshold || 95
    const isCompleted = completionPct >= threshold
    
    progress[videoId] = {
      watched_seconds: watchedDuration,
      completion_percentage: completionPct,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_position: currentPosition,
    }
    saveTrainingProgress(progress)
    
    const idx = trainingVideos.value.findIndex(v => v.id === videoId)
    if (idx >= 0) {
      trainingVideos.value[idx].progress = {
        ...trainingVideos.value[idx].progress,
        ...progress[videoId]
      }
    }
    
    console.log('[Training] Progress saved:', videoId, completionPct + '%')
  }
}

const fetchTrainingVideos = async (trainingId) => {
  trainingLoading.value = true
  trainingError.value = null
  trainingVideos.value = []
  hasLoadedVideos.value = false
  
  try {
    const response = await api.get(`/onboarding/training/${trainingId}/videos`)
    
    if (response.data) {
      const savedProgress = loadTrainingProgress()
      
      const videosWithProgress = (response.data.videos || []).map(video => ({
        ...video,
        progress: savedProgress[video.id] || video.progress || {
          watched_seconds: 0,
          total_seconds: video.duration_seconds || 0,
          completion_percentage: 0,
          is_completed: false,
          completed_at: null,
        }
      }))
      
      trainingVideos.value = videosWithProgress
      hasLoadedVideos.value = true
      
      if (videosWithProgress.length === 0) {
        trainingError.value = 'No training videos have been assigned. Please contact HR.'
      }
      
      console.log('[Training] Loaded', videosWithProgress.length, 'videos')
      logAuditEvent('TRAINING_VIDEOS_LOADED', { 
        count: videosWithProgress.length,
        trainingId 
      })
    }
  } catch (err) {
    console.error('Failed to fetch training videos:', err)
    trainingError.value = 'Failed to load training videos. Please try again.'
  } finally {
    trainingLoading.value = false
  }
}

const simulateVideoWatch = () => {
  const video = currentTrainingVideo.value
  if (!video) return
  
  const currentProgress = video.progress?.completion_percentage || 0
  const threshold = video.completion_threshold || 95
  
  if (currentProgress >= threshold) {
    stopVideoSimulation()
    return
  }
  
  const newProgress = Math.min(threshold, currentProgress + 5)
  const watchedSeconds = Math.floor((newProgress / 100) * video.duration_seconds)
  
  updateVideoProgress(video.id, watchedSeconds, watchedSeconds, newProgress)
  
  if (newProgress >= threshold) {
    stopVideoSimulation()
    logAuditEvent('VIDEO_COMPLETED', { videoId: video.id, title: video.title })
  }
}

const startVideoSimulation = () => {
  if (videoSimInterval.value) return
  videoPlaying.value = true
  videoSimInterval.value = setInterval(simulateVideoWatch, 2000)
  logAuditEvent('VIDEO_STARTED', { videoId: currentTrainingVideo.value?.id })
}

const stopVideoSimulation = () => {
  if (videoSimInterval.value) {
    clearInterval(videoSimInterval.value)
    videoSimInterval.value = null
  }
  videoPlaying.value = false
}

const toggleVideoPlayback = () => {
  if (videoPlaying.value) {
    stopVideoSimulation()
  } else {
    startVideoSimulation()
  }
}

const fetchOfferLetterData = async () => {
  try {
    const response = await api.get(`/onboarding/${onboarding.value?.id}/offer-letter`)
    if (response.data) {
      offerLetterData.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch offer letter:', err)
  }
}

const fetchGovFormsStatus = async () => {
  try {
    const response = await api.get('/onboarding/government-forms/draft')
    const result = response.data
    
    govFormsStatus.value = result.status
    govFormsVersion.value = result.version || '1.0'
    
    if (result.status === 'draft' && result.draft) {
      formData.value = { ...formData.value, ...result.draft }
      govFormsDraftSaved.value = result.savedAt
      govFormsLastSaved.value = result.draft.savedAt
      console.log('[Gov Forms] Loaded draft from server')
    } else if (result.status === 'submitted' && result.snapshot) {
      formData.value = { ...formData.value, ...result.snapshot }
      console.log('[Gov Forms] Loaded submitted snapshot')
    } else {
      console.log('[Gov Forms] No existing data found')
    }
  } catch (err) {
    console.error('Failed to fetch government forms status:', err)
  }
}

const saveGovFormsDraft = async (showNotification = true) => {
  if (govFormsSaving.value) return
  if (govFormsStatus.value === 'submitted') return
  
  govFormsSaving.value = true
  try {
    const draftData = {
      w4FilingStatus: formData.value.w4FilingStatus,
      w4Dependents: formData.value.w4Dependents,
      w4OtherIncome: formData.value.w4OtherIncome,
      w4Deductions: formData.value.w4Deductions,
      w4ExtraWithholding: formData.value.w4ExtraWithholding,
      w4TypedSignature: formData.value.w4TypedSignature,
      w4AttestationConfirmed: formData.value.w4AttestationConfirmed,
      i9DocType: formData.value.i9DocType,
      i9DocNumber: formData.value.i9DocNumber,
      i9Expiration: formData.value.i9Expiration,
      i9Status: formData.value.i9Status,
      i9TypedSignature: formData.value.i9TypedSignature,
      i9AttestationConfirmed: formData.value.i9AttestationConfirmed,
      i9UploadedFile: formData.value.i9UploadedFile,
      i9UploadedFileData: formData.value.i9UploadedFileData,
    }
    
    const response = await api.post('/onboarding/government-forms/draft', draftData)
    
    if (response.data.success) {
      govFormsStatus.value = 'draft'
      govFormsDraftSaved.value = new Date().toISOString()
      govFormsLastSaved.value = new Date().toISOString()
      logAuditEvent('GOV_FORMS_DRAFT_SAVED', { savedAt: govFormsDraftSaved.value })
      
      if (showNotification) {
        console.log('[Gov Forms] Draft saved successfully')
      }
    }
  } catch (err) {
    console.error('Failed to save government forms draft:', err)
  } finally {
    govFormsSaving.value = false
  }
}

const scheduleGovFormsAutoSave = () => {
  if (govFormsAutoSaveTimer) {
    clearTimeout(govFormsAutoSaveTimer)
  }
  govFormsAutoSaveTimer = setTimeout(() => {
    saveGovFormsDraft(false)
  }, 2000)
}

const selectTrainingVideo = (index) => {
  if (index >= 0 && index < trainingVideos.value.length) {
    currentVideoIndex.value = index
    stopVideoSimulation()
  }
}

const currentTask = computed(() => {
  if (currentTaskIndex.value === null || currentTaskIndex.value < 0) return null
  return taskStatuses.value[currentTaskIndex.value]
})

const progressPercent = computed(() => {
  if (!taskStatuses.value.length) return 0
  const completed = taskStatuses.value.filter(t => t.status === 'approved' || t.status === 'submitted').length
  return Math.round((completed / taskStatuses.value.length) * 100)
})

const requiredTasks = computed(() => taskStatuses.value.filter(t => t.task?.isRequired))

const canAccessTask = (index) => {
  const task = taskStatuses.value[index]
  
  if (index === 0) return true
  
  if (task.task?.type === 'offer_letter') {
    const personalInfoTask = taskStatuses.value.find(t => t.task?.type === 'personal_info')
    if (personalInfoTask) {
      return personalInfoTask.status === 'submitted' || personalInfoTask.status === 'approved'
    }
    return false
  }
  
  for (let i = 0; i < index; i++) {
    const prevTask = taskStatuses.value[i]
    if (prevTask.status !== 'submitted' && prevTask.status !== 'approved') return false
  }
  return true
}

const formatStatus = (status) => {
  const statuses = { draft: 'Not Started', submitted: 'Pending Review', approved: 'Completed', rejected: 'Needs Fix' }
  return statuses[status] || status
}

const formatTaskType = (type) => {
  const types = {
    personal_info: 'Personal Information',
    offer_letter: 'Offer Letter',
    government_forms: 'Government Forms',
    document_upload: 'Document Upload',
    policy_acknowledgment: 'Policy Acknowledgement',
    training_acknowledgment: 'Training',
    e_signature: 'E-Signature',
    role_confirmation: 'Role Confirmation'
  }
  return types[type] || type
}

const getDocTitle = (type) => {
  const titles = { offer_letter: 'Offer Letter', nda: 'Non-Disclosure Agreement', job_description: 'Job Description', arbitration: 'Arbitration Agreement' }
  return titles[type] || 'Document'
}

const selectTask = async (index) => {
  if (!canAccessTask(index)) {
    console.log('[Navigation] Cannot access task at index', index)
    return
  }
  
  logAuditEvent('STEP_ENTERED', { 
    stepIndex: index, 
    taskId: taskStatuses.value[index]?.taskId,
    taskType: taskStatuses.value[index]?.task?.type 
  })
  
  currentTaskIndex.value = index
  saveCurrentStep(index)
  
  stopVideoSimulation()
  
  const task = taskStatuses.value[index]
  const candidate = onboarding.value?.candidate
  const savedFormData = getSavedFormData(task.taskId, task.task?.type)
  
  if (task.task?.type === 'personal_info') {
    formData.value = savedFormData || {
      firstName: candidate?.firstName || '',
      lastName: candidate?.lastName || '',
      address: candidate?.address || '',
      city: candidate?.city || '',
      state: candidate?.state || '',
      zipCode: candidate?.zipCode || '',
      dateOfBirth: candidate?.dateOfBirth || '',
      emergencyName: candidate?.emergencyName || '',
      emergencyPhone: candidate?.emergencyPhone || '',
      ssn: ''
    }
  } else if (task.task?.type === 'offer_letter') {
    formData.value = savedFormData || {
      offerLetterTypedSignature: '',
      offerLetterAttestationConfirmed: false,
      offerLetterRead: false,
      offerLetterAccepted: false
    }
    await fetchOfferLetterData()
  } else if (task.task?.type === 'government_forms') {
    // Reset state for new task selection
    govFormsStatus.value = 'empty'
    govFormsDraftSaved.value = null
    govFormsLastSaved.value = null
    
    // Start with empty form, then load from server
    formData.value = savedFormData || {}
    
    // Fetch existing draft or submitted snapshot from server
    await fetchGovFormsStatus()
  } else if (task.task?.type === 'document_upload') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'policy_acknowledgment') {
    formData.value = savedFormData || { policyAccepted: false, policyAgreed: false, policySignature: '' }
  } else if (task.task?.type === 'training_acknowledgment') {
    formData.value = savedFormData || { trainingSignature: '', trainingAccepted: false, trainingAgreed: false }
    currentVideoIndex.value = 0
    await fetchTrainingVideos(task.taskId)
  } else if (task.task?.type === 'e_signature') {
    formData.value = savedFormData || {}
  } else if (task.task?.type === 'role_confirmation') {
    formData.value = savedFormData || {
      roleConfirmed: false,
      roleUnderstood: false,
      roleSignature: ''
    }
  } else {
    formData.value = savedFormData || {}
  }
}

const checkScroll = () => {
  if (policyScroll.value) {
    const { scrollTop, scrollHeight, clientHeight } = policyScroll.value
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      formData.value.policyScrolled = true
    }
  }
}

const isNameMatch = (typedName) => {
  if (!typedName || !formData.value.firstName) return false
  const typed = typedName.trim().toLowerCase()
  const legalFull = `${formData.value.firstName} ${formData.value.lastName}`.toLowerCase().trim()
  const legalNoSpace = `${formData.value.firstName}${formData.value.lastName}`.toLowerCase().trim()
  return typed === legalFull || typed === legalNoSpace
}

const formatSavedTime = (isoString) => {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  } catch {
    return isoString
  }
}

const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return 'unknown'
  }
}

const handleI9FileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      e.target.value = ''
      return
    }
    formData.value.i9UploadedFile = file.name
    const reader = new FileReader()
    reader.onload = (event) => {
      formData.value.i9UploadedFileData = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleFileUpload = (e, docType = 'other') => {
  const file = e.target.files[0]
  if (file) {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      e.target.value = ''
      return
    }
    
    const fileFieldMap = {
      government_id: 'governmentIdFile',
      drivers_license: 'driversLicenseFile',
      certification: 'certificationFile',
      education: 'educationFile',
      other: 'otherFile'
    }
    
    const dataFieldMap = {
      government_id: 'governmentIdFileData',
      drivers_license: 'driversLicenseFileData',
      certification: 'certificationFileData',
      education: 'educationFileData',
      other: 'otherFileData'
    }
    
    const fileField = fileFieldMap[docType] || 'otherFile'
    const dataField = dataFieldMap[docType] || 'otherFileData'
    
    formData.value[fileField] = file.name
    const reader = new FileReader()
    reader.onload = (event) => {
      formData.value[dataField] = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const goToNextStep = async () => {
  const nextIndex = currentTaskIndex.value + 1
  if (nextIndex < taskStatuses.value.length && canAccessTask(nextIndex)) {
    await selectTask(nextIndex)
    logAuditEvent('STEP_NAVIGATED', { direction: 'next', toIndex: nextIndex })
  }
}

const submitTask = async () => {
  if (currentTask.value?.task?.type === 'offer_letter') {
    if (!formData.value.offerLetterTypedSignature || formData.value.offerLetterTypedSignature.trim().length < 2) {
      alert('Please type your full legal name to sign the offer letter')
      return
    }
    if (!formData.value.offerLetterAttestationConfirmed) {
      alert('Please confirm the attestation to sign the offer letter')
      return
    }
    if (!formData.value.offerLetterRead) {
      alert('Please confirm that you have read the offer letter')
      return
    }
    if (!formData.value.offerLetterAccepted) {
      alert('Please accept the terms and conditions of the offer letter')
      return
    }
  }

  if (currentTask.value?.task?.type === 'e_signature') {
    if (!formData.value.typedSignature || !formData.value.typedSignature.trim()) {
      alert('Please type your full legal name to sign')
      return
    }
    if (!formData.value.attestationConfirmed) {
      alert('Please confirm the attestation to sign')
      return
    }
    if (formData.value.typedSignature && !isNameMatch(formData.value.typedSignature)) {
      alert('Signature name must match your legal name. Please type your exact legal name.')
      return
    }
  }
  
  if (currentTask.value?.task?.type === 'government_forms') {
    if (!formData.value.w4TypedSignature || formData.value.w4TypedSignature.trim().length < 2) {
      alert('Please type your name to sign Form W-4')
      return
    }
    if (!formData.value.w4AttestationConfirmed) {
      alert('Please confirm the attestation for Form W-4')
      return
    }
    if (!formData.value.i9TypedSignature || formData.value.i9TypedSignature.trim().length < 2) {
      alert('Please type your name to sign Form I-9')
      return
    }
    if (!formData.value.i9AttestationConfirmed) {
      alert('Please confirm the attestation for Form I-9')
      return
    }
    if (!formData.value.i9UploadedFileData) {
      alert('Please upload your ID document before submitting')
      return
    }
  }
  
  submitting.value = true
  try {
    if (currentTask.value?.task?.type === 'offer_letter' && formData.value.offerLetterTypedSignature) {
      formData.value.offerLetterSignedAt = new Date().toISOString()
      formData.value.offerLetterSignatureMethod = 'typed_name'
      formData.value.offerLetterSignatureIp = await getClientIP()
      formData.value.offerLetterSignatureUserAgent = navigator.userAgent
    }

    if (currentTask.value?.task?.type === 'e_signature' && formData.value.typedSignature) {
      formData.value.signedAt = new Date().toISOString()
      formData.value.signatureMethod = 'typed_name'
      formData.value.signatureIp = await getClientIP()
      formData.value.signatureUserAgent = navigator.userAgent
    }
    
    if (currentTask.value?.task?.type === 'government_forms') {
      if (formData.value.w4TypedSignature) {
        formData.value.w4SignedAt = new Date().toISOString()
        formData.value.w4SignatureMethod = 'typed_name'
        formData.value.w4SignatureIp = await getClientIP()
      }
      if (formData.value.i9TypedSignature) {
        formData.value.i9SignedAt = new Date().toISOString()
        formData.value.i9SignatureMethod = 'typed_name'
        formData.value.i9SignatureIp = await getClientIP()
      }
    }
    
    if (currentTask.value?.task?.type === 'government_forms') {
      const submitResponse = await api.post('/onboarding/government-forms/submit', {
        ...formData.value
      })
      
      if (submitResponse.error) {
        alert(submitResponse.error.message)
        return
      }
      
      govFormsStatus.value = 'submitted'
      logAuditEvent('GOV_FORMS_SUBMITTED', {
        snapshotId: submitResponse.data?.snapshotId,
        submittedAt: submitResponse.data?.submittedAt
      })
    }
    
    await api.post(`/onboarding/${onboarding.value.id}/tasks/${currentTask.value.taskId}/submit`, {
      submissionData: formData.value
    })
    
    logAuditEvent('STEP_COMPLETED', { 
      taskId: currentTask.value.taskId,
      taskType: currentTask.value?.task?.type
    })
    
    if (currentTaskIndex.value < taskStatuses.value.length - 1) {
      await selectTask(currentTaskIndex.value + 1)
    } else {
      submittedTask.value = currentTask.value.task?.name
      showConfirmation.value = true
    }
  } catch (err) {
    console.error('Submit error:', err)
    alert('Failed to submit task: ' + err.message)
  } finally {
    submitting.value = false
  }
}

const closeConfirmation = () => {
  showConfirmation.value = false
  submittedTask.value = null
  if (currentTaskIndex.value < taskStatuses.value.length - 1) {
    selectTask(currentTaskIndex.value + 1)
  }
}

onMounted(async () => {
  try {
    const response = await api.get(`/onboarding/token/${token}`)
    const data = response.data
    onboarding.value = data
    taskStatuses.value = data.taskStatuses || []
    
    const firstIncompleteIndex = taskStatuses.value.findIndex(t => t.status !== 'submitted' && t.status !== 'approved')
    
    if (firstIncompleteIndex !== null && firstIncompleteIndex >= 0) {
      await selectTask(firstIncompleteIndex)
    } else if (taskStatuses.value.length > 0) {
      await selectTask(0)
    }
    
    logAuditEvent('ONBOARDING_STARTED', { 
      candidateId: onboarding.value?.candidate?.id,
      taskCount: taskStatuses.value.length
    })
  } catch (err) {
    console.error('Failed to load onboarding:', err)
  }
})

// Navigation safety - auto-save government forms when leaving
const handleBeforeUnload = async (e) => {
  if (currentTask.value?.task?.type === 'government_forms' && govFormsStatus.value !== 'submitted') {
    // Attempt to save draft before leaving
    await saveGovFormsDraft(false)
    
    // If save failed, show warning
    if (govFormsSaving.value) {
      e.preventDefault()
      e.returnValue = 'Your form is being saved. Are you sure you want to leave?'
      return e.returnValue
    }
  }
  
  // Also save any pending video progress
  if (videoSimInterval.value) {
    stopVideoSimulation()
  }
}

// Watch for current task changes to add/remove beforeunload listener
watch(() => currentTask.value?.task?.type, (newType, oldType) => {
  if (newType === 'government_forms') {
    window.addEventListener('beforeunload', handleBeforeUnload)
  } else if (oldType === 'government_forms') {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // Save draft when leaving government forms task
    if (govFormsStatus.value !== 'submitted') {
      saveGovFormsDraft(false)
    }
  }
})

onUnmounted(async () => {
  stopVideoSimulation()
  
  // Clean up beforeunload listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
  
  // Final save for government forms
  if (currentTask.value?.task?.type === 'government_forms' && govFormsStatus.value !== 'submitted') {
    await saveGovFormsDraft(false)
  }
})
</script>

<style scoped>
.onboarding-portal {
  min-height: 100vh;
  background: #0f172a;
}

.portal-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  border-bottom: 1px solid #334155;
}

.header-content h1 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #94a3b8;
}

.progress-section {
  margin-top: 1.5rem;
  max-width: 400px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
}

.progress-fill {
  height: 100%;
  background: #006e5b;
  border-radius: 4px;
  transition: width 0.3s;
}

.portal-content {
  display: flex;
  min-height: calc(100vh - 200px);
}

.task-sidebar {
  width: 280px;
  background: #1e293b;
  padding: 1.5rem;
  border-right: 1px solid #334155;
}

.task-sidebar h3 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.task-item:hover:not(.locked) {
  background: #334155;
}

.task-item.active {
  background: #006e5b;
}

.task-item.completed {
  opacity: 0.7;
}

.task-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.task-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-weight: 600;
}

.task-item.active .task-icon {
  background: white;
  color: #006e5b;
}

.task-item.completed .task-icon {
  background: #006e5b;
}

.check {
  color: white;
}

.rejected {
  color: #ef4444;
}

.lock {
  font-size: 0.875rem;
}

.task-info {
  flex: 1;
}

.task-name {
  display: block;
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
}

.task-status-text {
  display: block;
  color: #94a3b8;
  font-size: 0.75rem;
}

.task-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.welcome-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-card {
  background: #1e293b;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  max-width: 500px;
}

.welcome-card h2 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.welcome-card p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.requirements {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: left;
}

.requirements h3 {
  color: #f8fafc;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.requirements ul {
  color: #94a3b8;
  padding-left: 1.25rem;
}

.requirements li {
  margin-bottom: 0.5rem;
}

.btn-start {
  background: #006e5b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  background: #005a4a;
  transform: translateY(-2px);
}

.task-detail {
  background: #1e293b;
  border-radius: 16px;
  padding: 2rem;
}

.task-header {
  margin-bottom: 2rem;
}

.task-header h2 {
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.task-header p {
  color: #94a3b8;
}

.task-type-badge {
  display: inline-block;
  background: #334155;
  color: #94a3b8;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.completed-message, .rejected-message {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
}

.completed-message {
  background: rgba(0, 110, 91, 0.1);
}

.rejected-message {
  background: rgba(239, 68, 68, 0.1);
}

.check-icon, .warning-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.completed-message .check-icon { color: #006e5b; }
.rejected-message .warning-icon { color: #ef4444; }

.comment {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-retry {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #f8fafc;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #334155;
}

.form-info {
  color: #94a3b8;
  background: #0f172a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f8fafc;
  font-size: 0.875rem;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #006e5b;
}

.form-group small {
  display: block;
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1.5rem; }

.form-subsection {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-desc {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.signature-field {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

.signature-field label {
  display: block;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.signature-line {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.signature-date {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.file-upload {
  border: 2px dashed #334155;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.file-upload:hover {
  border-color: #006e5b;
}

.file-upload input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
}

.file-name {
  color: #006e5b;
}

.file-remove {
  color: #ef4444;
  cursor: pointer;
  font-size: 1.25rem;
}

.policy-content {
  background: #0f172a;
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.policy-text h5 {
  color: #f8fafc;
  margin: 1rem 0 0.5rem;
}

.policy-text p {
  color: #94a3b8;
  line-height: 1.6;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto !important;
  margin-top: 0.25rem;
}

.checkbox-label span {
  color: #e2e8f0;
}

.training-item {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.training-header h4 {
  color: #f8fafc;
}

.training-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.training-status.pending {
  background: #f59e0b;
  color: white;
}

.document-preview {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
}

.doc-header {
  background: #334155;
  padding: 1rem;
}

.doc-header h4 {
  color: #f8fafc;
}

.doc-content {
  padding: 1.5rem;
  color: #94a3b8;
  line-height: 1.8;
}

.doc-version {
  font-size: 0.75rem;
  color: #94a3b8;
  background: #334155;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.offer-letter-content {
  max-height: 400px;
  overflow-y: auto;
}

.offer-letter-content p {
  white-space: pre-wrap;
  color: #1e293b;
  background: #fff;
  padding: 1rem;
  border-radius: 6px;
}

.signature-pad {
  position: relative;
  background: linear-gradient(to bottom, #fff 0%, #fafafa 100%);
  border: 2px solid #ccc;
  border-radius: 8px;
  cursor: crosshair;
  width: 100%;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

/* Typed Signature Styles (replaces canvas) */
.signature-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.signature-instruction {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.typed-signature-wrapper {
  margin-bottom: 1rem;
}

.typed-signature-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1.125rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.typed-signature-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.typed-signature-input.signature-match {
  border-color: #38a169;
  background-color: #f0fff4;
}

.typed-signature-input.signature-mismatch {
  border-color: #e53e3e;
  background-color: #fff5f5;
}

.signature-warning {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fff5f5;
  border-radius: 4px;
}

.signature-verified {
  color: #38a169;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0fff4;
  border-radius: 4px;
  font-weight: 600;
}

.attestation-checkbox {
  margin: 1rem 0;
}

.attestation-checkbox .checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.attestation-checkbox input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  cursor: pointer;
  accent-color: #3182ce;
}

.attestation-checkbox span {
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.5;
}

.signature-date {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.legal-text {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.75rem;
  line-height: 1.5;
}

.role-details {
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #334155;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #94a3b8;
  width: 150px;
}

.detail-row .value {
  color: #f8fafc;
  font-weight: 500;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #334155;
}

.btn-submit {
  background: #006e5b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #005a4a;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirmation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.confirmation-content {
  background: #1e293b;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #006e5b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  margin: 0 auto 1.5rem;
}

.confirmation-content h2 {
  color: #f8fafc;
  margin-bottom: 1rem;
}

.confirmation-content p {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.confirmation-content .next-step {
  font-size: 0.875rem;
  margin-top: 1rem;
}

.btn-continue {
  background: #006e5b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s;
}

.btn-continue:hover {
  background: #005a4a;
  transform: translateY(-2px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Training Video Styles */
.training-progress-summary {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.training-progress-summary .progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.training-progress-summary .progress-fill {
  height: 100%;
  background: #48bb78;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-ready {
  background: #f0fff4;
  color: #276749;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-waiting {
  background: #fffaf0;
  color: #975a16;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.video-list {
  margin-bottom: 1.5rem;
}

.video-item {
  display: flex;
  align-items: flex-start;
  background: #0f172a;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.video-item:hover {
  background: #1e293b;
}

.video-item.video-active {
  border-color: #3182ce;
  background: #1e293b;
}

.video-thumbnail {
  width: 60px;
  height: 45px;
  background: #334155;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.thumbnail-play {
  color: #fff;
  font-size: 14px;
}

.thumbnail-check {
  color: #48bb78;
  font-size: 18px;
  font-weight: bold;
}

.video-info {
  flex: 1;
}

.video-title {
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.video-title:hover {
  color: #3182ce;
}

.required-badge {
  color: #e53e3e;
  font-weight: bold;
}

.video-duration {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.video-progress-bar {
  height: 4px;
  background: #334155;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.video-progress-fill {
  height: 100%;
  background: #3182ce;
  transition: width 0.3s;
}

.video-progress-fill.progress-complete {
  background: #48bb78;
}

.video-status {
  color: #64748b;
  font-size: 0.75rem;
}

.current-video {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.now-playing {
  color: #3182ce;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.current-video .video-name {
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.video-description {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.video-player {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #1a202c;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.html5-video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-progress-bar-external {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 8px 8px;
  margin-top: -0.5rem;
}

.player-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-placeholder {
  text-align: center;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  color: #fff;
  font-size: 24px;
}

.player-text {
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.player-subtext {
  color: #94a3b8;
  font-size: 0.75rem;
}

.video-progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-indicator {
  height: 100%;
  background: #3182ce;
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-indicator.indicator-complete {
  background: #48bb78;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 0.75rem;
}

.video-required-notice {
  background: #fffaf0;
  color: #975a16;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.video-completed-badge {
  background: #48bb78;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
}

.anticheat-notice {
  background: #edf2f7;
  color: #64748b;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.5;
}

.acknowledge-section {
  background: #0f172a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #334155;
}

.acknowledge-section.ready {
  border-color: #48bb78;
  background: linear-gradient(to bottom, rgba(72, 187, 120, 0.05), #0f172a);
}

.acknowledge-section .signature-field {
  margin-bottom: 1.25rem;
}

.acknowledge-section .signature-field input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.acknowledge-section .checkbox-label input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.acknowledge-section .checkbox-label span {
  color: #94a3b8;
}

.training-list {
  margin-bottom: 1.5rem;
}

/* Optional Document Upload Styles */
.optional-docs-list {
  margin-top: 1.5rem;
}

.optional-doc-item {
  background: #0f172a;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #334155;
}

.doc-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.doc-type-label {
  color: #f8fafc;
  font-weight: 500;
  font-size: 0.875rem;
}

.optional-badge {
  background: #48bb78;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.optional-upload {
  border-color: #334155;
  background: #1e293b;
}

.optional-upload:hover {
  border-color: #48bb78;
}

.optional-upload .upload-icon {
  color: #94a3b8;
}

.optional-upload p {
  color: #94a3b8;
  font-size: 0.875rem;
}

.uploads-summary {
  background: #1e293b;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  border: 1px solid #48bb78;
}

.uploads-summary h4 {
  color: #48bb78;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.uploads-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.uploads-summary li {
  color: #94a3b8;
  font-size: 0.8rem;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.uploads-summary li::before {
  content: '✓';
  color: #48bb78;
  font-weight: bold;
}

/* Government Forms Status Styles */
.gov-forms-status-bar {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-submitted {
  background: rgba(72, 187, 120, 0.15);
  border: 1px solid #48bb78;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-submitted .status-icon {
  color: #48bb78;
  font-size: 1.25rem;
}

.status-submitted .status-text {
  color: #48bb78;
  font-weight: 600;
}

.status-submitted .status-detail {
  color: #64748b;
  font-size: 0.75rem;
  margin-left: auto;
}

.status-draft {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid #3b82f6;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.status-saved, .status-saving {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
}

.status-saved .status-icon {
  font-size: 1rem;
}

.status-saved .status-text {
  font-weight: 500;
}

.status-saved .status-detail {
  color: #64748b;
  font-size: 0.75rem;
  margin-left: auto;
}

.status-saving {
  font-weight: 500;
}

.saving-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-empty {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid #64748b;
  color: #94a3b8;
  font-size: 0.875rem;
}

.submitted-notice {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.submitted-notice strong {
  color: #3b82f6;
}

.readonly-mode {
  opacity: 0.7;
}

.readonly-mode input,
.readonly-mode select,
.readonly-mode textarea {
  background: #1e293b !important;
  cursor: not-allowed;
}

.upload-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.upload-disabled input {
  display: none;
}

.signature-verified {
  border-color: #48bb78 !important;
  background-color: rgba(72, 187, 120, 0.05) !important;
}
</style>
