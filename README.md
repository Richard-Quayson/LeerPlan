<p align="center">
  <img src="leerplanlogo.png" alt="LeerPlan Logo" height="200px">
</p>

# Leerplan: Intelligent Study Planning Application

Leerplan is an innovative study planning application that leverages advanced technologies to streamline course management and enhance the user experience. This project combines a robust Django-based backend with a modern React frontend, integrating Large Language Model (LLM) capabilities for intelligent data processing.

## Project Structure

- `analysis`: Contains the script for analysing the experiment
- `leerplan_api/`: Django backend with REST Framework
  - Account app: Manages user accounts and authentication
  - Course app: Handles course-related functionalities
  - Data Synthesis: Utilizes Gemini PRO for structured data extraction
- `leerplan_interface/`: React + Vite frontend application
- `miscellaneous/`: Contains database plans and LLM testing directories
- `.gitignore`: Specifies intentionally untracked files
- `leerplanlogo.png`: LeerPlan's logo
- `LICENSE`: Project license information

## Key Features

1. User account management
2. Course information management
3. Intelligent PDF data extraction using LLMs
4. RESTful API for seamless frontend-backend integration
5. Modern, responsive user interface

## Technology Stack

- Backend: Django, Django REST Framework
- Frontend: React, Vite
- LLM Integration: Google Gemini PRO
- Database: SQLLite3 (test dB)

## Getting Started

Check the `leerplan_api` directory for instructions on how to set up the API and the `leerplan_interface` directory for instructions on how to set up the interface


## Contributing

To contribute to this project create a fork of the repository, make the proposed changes in a branch and then create an issue with detailed descriptions on the proposed changes. Find detailed instructions [here](https://github.com/Richard-Quayson/LeerPlan/main/contribute)


## Recommendations for Future Work

1.	**LMS Integration:** Developing LeerPlan for seamless integration with existing Learning Management Systems could significantly improve data collection and ease of use. This integration could automate the process of importing course information, further reducing manual input.

2.	**Enhanced Customisation:** Future iterations of LeerPlan should allow for customisation of event cards and editing of events after time block creation. This would give users more flexibility and control over their schedules, potentially increasing satisfaction and long-term adoption.



## Acknowledgements

I would like to express our gratitude to Google for making their models available through the Gemini API Competition, which has significantly enhanced the data synthesis capabilities of our application.

## Research Abstract

With the evolution of applications, text inputs have become the most preferred form of collecting user data due to their structured form, as text input data can easily be mapped to the label keys. Technological advancements have improved the use of other input formats like images, where with the development of Optical Character Recognition tools, data can be recognised from images. Strides are underway to incorporate audio input in applications with speech recognition and synthesis tools. However, there is limited adoption of file input formats, especially Portable Document Format (PDF) files in mobile and web applications, primarily due to the highly unstructured data in PDF files. This research paper explores the role of Large Language Models in enhancing the accuracy of data collected from PDF files through structured prompting. Consequently, it explores the role of ease of data collection in influencing adoption using study applications as a case study and proposes an extension of the Technology Acceptance Model. Finally, it proposes ease of data collection as a factor influencing user's perceived ease of use of applications. 

**Keywords:** Ease of Data Collection, User Adoption, PDF Data Extraction, Large Language Models, Structured Prompting, Study Planning.
