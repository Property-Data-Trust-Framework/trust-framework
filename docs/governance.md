# Governance Principles

## Principles of Governance

The framework should align with the following principles:

- **Transparency**: Clear processes and open communication about decisions and changes.
- **Inclusivity**: PDTF governance is open to all OPDA members. Members are encouraged to invite opinions from other key stakeholders in the home buying and selling process.
- **Accountability**: Clear roles, responsibilities, and mechanisms for decision-making and dispute resolution.
- **Adaptability**: Ability to evolve based on feedback, technological advancements, and regulatory changes.
- **Compliance**: Adherence to UK GDPR, the Data Protection Act 2018, and relevant industry or regulatory guidance.

---

# Governance Roles and Responsibilities

# Co-ordination

## Responsibilities
- Maintain the overall vision and roadmap for the PDTF.
- Ensure alignment with the framework’s principles (standardisation, interoperability, and transparency).
- Facilitate discussions, set agendas, and manage timelines for decisions.
- Escalate disputes to an ODPA, if consensus cannot be reached.

## Composition
- TBA

## Processes
- Decisions are made by majority agreement.
- Raising disputes to ODPA when wider governance is required.

---

# Technical Review

## Responsibilities
- Review and approve proposed technical changes to the schema.
- Maintain the integrity of the “Stable” areas of the schema and define criteria for changes.
- Ensure changes are interoperable and feasible for implementation.
- Ensure changes are backwards compatible with prior versions.
- Manage the submission, review, and approval of change proposals.
- Define and enforce structured processes for raising, documenting, and resolving issues.
- Maintain a log of all changes, including rationale and impact assessments.

## Composition
- All technical PDTF members

## Processes
- Technical proposals require approval from at least two members of the group.
- Maintain and ensure the change request process is followed.
- Maintain an architectural decision record.
- Maintain versioning of minor and major releases.

---

# Compliance and Risk

## Responsibilities
- Ensure PDTF complies with UK GDPR and other relevant data protection legislation.
- Assess and document the data protection impact of proposed changes.
- Maintain a log of compliance policies, non-compliance incidents, and their resolutions.
- Develop and enforce guidelines on the use of PII within the framework.

## Composition
- By nomination of any ODPA member organisation.

## Processes
- Compliance check of proposed major schema releases before release.
- Provide guidance for potential schema changes.

---

# Engagement (Stakeholder Representation)

## Responsibilities
- Encourage interactions from external stakeholders (e.g., conveyancers, estate agents, HMLR, buyers, and sellers).
- Gather and consolidate stakeholder feedback on roadmap priorities and schema changes.
- Notify impacted parties of proposed changes and invite comments.
- Promote transparency by publishing regular updates on the framework’s progress.

## Composition
- TBA

## Processes
- Stakeholder feedback is summarised and presented for consideration.
- Regular interactions with external stakeholders.
- Regular publishing of findings related to PDTF.

---

# Change Management Process

# Standard Operating Procedure (SOP) for PDTF Schema Changes

This process applies to all contributors and stakeholders proposing changes to the PDTF schema. This SOP does not differentiate between the type of work being performed. Review on whether changes should be included in the schema needs to be determined elsewhere.

## Process Overview
1. **Submission**
2. **Implementation**
3. **Impact Assessment**
4. **Review**
5. **Documentation**
6. **Approval**
7. **Stakeholder Notification**
8. **Release**

---

## Process Flow

### Submission
- **Submit a GitHub issue for the proposed change**:
  - Submit the proposal using the Standard Change Proposal Form (Template to be generated).
  - **Required fields**:
    - **Change Reference Identifier**: To be referenced in the architecture decision record.
    - **Change Type**: Change or bug fix.
    - **Change Reason**: Justification for the change.
    - **Technical Details**: Description of the proposed modification.
    - **Impacted Areas**: Schema elements to be changed. Highlight if any "stable" areas of the schema will be changed as a priority.
    - **Stakeholder Impact**: Organisations or individuals affected.
  - **Author’s Responsibilities**:
    - Ensure alignment with the PDTF roadmap.
    - Determine if comments from technical reviewers are needed before implementation begins.
    - Gain consensus upfront to increase the likelihood of approval for release.

---

### Implementation
- Complete implementation in a new branch linked to the issue raised.

---

### Impact Assessment
- Conduct an impact assessment to address risks and compliance concerns.
- Refer to the associated Impact Assessment Form for guidance.

---

### Review
- **Pull Request**:
  - Raise a pull request to the `next` branch and invite Technical Reviewers to review.
  - **Approval Requirements**:
    - At least *X* Technical Reviewers must approve promotion to the `next` branch.
    - Higher barriers for changes to "stable" schema elements or those impacting backwards compatibility.
  - Resolve issues highlighted during the review process.
  - Upon completion of the review, promote the change to the `next` branch.
  - **Branch Management**:
    - Squash incoming commits for easier cherry-picking.
    - Retain and archive completed change branches.
    - Link completed pull requests to the corresponding raised issue.

---

### Documentation
- Update all relevant documentation to reflect the change.

---

### Approval
- **Stakeholder Communication**:
  - Notify stakeholders of proposed changes moving from `next` to `master` and allow feedback.
  - Include the following in the communication:
    - **Change Reference Identifier**: Link to the original GitHub issue or proposal.
    - **Description**: Summary of the proposed change, including purpose and impact.
    - **Breaking Changes**: Highlight backwards compatibility issues and suggested mitigations.
    - **Date of Intended Merge**: Provide a minimum of *X* working days for feedback.
  - **Approval Requirements**:
    - For standard changes: At least two reviewers from different stakeholders.
    - For stable schema changes or backwards compatibility implications: 
      - Higher barriers such as three reviewers or broader consensus.
    - Conduct additional compliance and risk assessments if needed.
  - Consider stakeholder versions when scheduling releases.
- **Final Approval**:
  - Merge approved changes into the `master` branch.
  - Link all associated issues in the pull request.
  - Tag the commit with a custom release version.

---

### Stakeholder Notification
- **Notification Steps**:
  - Notify stakeholders of changes, especially for unstable schema parts or non-breaking changes.
  - For breaking or stability changes, notify stakeholders before the approval step.
  - Use the Change Notification Template for standard changes.
  - Use the Breaking Change Notification Template for stability or breaking changes.

---

### Release
- Once fully approved, the release is considered operational.
- Stakeholder organisations are advised to update the Stakeholder Version Register to ensure transparency within the ecosystem regarding their level of PDTF integration.
