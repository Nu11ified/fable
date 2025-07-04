# Project Dev Log

## Phase 1: Backend & Authentication

-   [X] **Authentication**
    -   [X] Implement Better-Auth with the GitHub OAuth provider.
    -   [X] Create a tRPC `adminProcedure` to protect admin routes, hardcoded to my GitHub user ID (use Better Auth API).
    -   [X] Create a tRPC `userProcedure` to protect routes requiring any logged-in user (e.g., commenting or locked posts).

-   [X] **Database Schemas (Drizzle)**
    -   [X] Define `Resume` schema (for experience, education, etc.).
    -   [X] Define `Portfolio` schema (for projects).
    -   [X] Define `Blog` schema (for posts).
    -   [X] Define `Comment` and `User` schemas.

-   [X] **API Routes (tRPC)**
    -   [X] **Admin Routes:**
        -   [X] `resume.add`, `resume.update`, `resume.delete`
        -   [X] `portfolio.add`, `portfolio.update`, `portfolio.delete`, `star.portfolio.add`, `star.portfolio.delete` 
        -   [X] `blog.add`, `blog.update`, `blog.delete`, `lock.blog.add`, `lock.blog.delete`, , `star.blog.add`, `star.blog.delete` 
        -   [X] `users.ban`, `user.unban`
         -  [X] `comments.delete`, `star.comment.add`, `star.comment.delete`
    -   [X] **Public Routes:**
        -   [X] `resume.get`
        -   [X] `portfolio.getAll`, `portfolio.getById`
        -   [X] `blog.getAll`, `blog.getById`
    -   [X] **User Routes:**
        -   [X] `blog.addComment`
        -   [X] `blog.viewLockedPost`

## Phase 2: Frontend UI & Design

-   [X] **Setup & Theming**
    -   [X] Install and configure `shadcn/ui`.
    -   [X] Implement light/dark mode toggle.
    -   [X] Implement the core theme.

-   **Design System & Style Guide**
    <details>
      <summary>Click to expand Style Guide</summary>
    
      The resume website will feature a clean, modern, and minimalist design aesthetic, built using the shadcn/ui component library. The layout will be single-column and easily scannable, with clear headings and generous white space to ensure readability. The typography will be based on a sans-serif font, such as Inter, for a professional and accessible look. The color scheme will be simple and elegant, with a neutral primary color and a single accent color for links and highlights. A prominent feature will be a light and dark mode toggle, allowing users to switch between a light theme with dark text on a light background and a dark theme with light text on a dark background, ensuring a comfortable viewing experience in any lighting condition.
    
      Sections across the site, such as 'Experience' on the resume or the main content of a blog post, will be clearly defined using subtle separators and generous vertical spacing to maintain a clean, uncluttered layout. List-based pages, including the main Portfolio and Blog views, will utilize a responsive grid of cards. Each card will be minimalist, featuring a thin border, rounded corners, and a subtle box-shadow that intensifies on hover for user feedback. The internal structure of a card will be consistent, typically containing a heading, a short description, and relevant metadata presented as Badge components (e.g., technologies used, post category). The admin panel will leverage these cards extensively for content management, with each card representing an item like a project or post and containing action buttons for 'Edit' and 'Delete'. Blog post cards will also uniquely showcase the most upvoted user comment directly on the card itself, providing a snapshot of community engagement.
    </details>

## Phase 3: Page & Component Implementation

-   [ ] **Admin Panel**
    -   [X] Build Resume management interface.
    -   [X] Build Portfolio management interface.
        -   [X] GitHub-based image storage system with automatic repository creation
        -   [X] Photo uploader component with drag-and-drop functionality
    -   [X] **Photo Upload Manager** (Dedicated upload area at `/admin/upload`)
        -   [X] Enhanced photo uploader with drag-and-drop functionality
        -   [X] Upload history and management interface
        -   [X] GitHub integration status monitoring
        -   [X] URL copying and image preview features
    -   [X] Build Blog management interface.
        -   [X] Create a proper Blocknote component that will be used for rich text editor that will translate into a json that will be stored in the database 
        -   [X] Have the photo upload intergration + image url + rich text compatbility 
    -   [X] User management interface.
    -   [X] Comment management interface.
 
-   [ ] **Public-Facing Pages**
    -   [ ] **Home Page**
        -   [ ] Create main page layout.
        -   [ ] Home page with the name, city/country, etc.
        -   [ ] Starred list of projects
        -   [ ] Starred list of blog posts
        -   [ ] All of the skills 
        -   [ ] Total Github stats such as languages used, commits, etc.
    -   [ ] **Resume Page**
        -   [ ] Create main page layout.
        -   [ ] Home page with the name, city/country, etc.
        -   [ ] Starred list of projects
        -   [ ] Build `Experience` section component.
        -   [ ] Build `Education` section component.
        -   [ ] Build `Skills` section component.
        -   [ ] Build `Interests` section component. 
    -   [ ] **Portfolio Page**
        -   [ ] Build portfolio list view with project cards.
        -   [ ] Build detailed project view page.
    -   [ ] **Blog Page**
        -   [ ] Build blog list view with post cards.
        -   [ ] Build individual blog post page.
        -   [ ] Implement comment section with sorting logic.

-   [ ] **Miscelenous Features**
    -   [ ] **Admin Features**
        -   [ ] In the public sided area the admin should be able to star/delete comments and ban users if they hover over the users name and comment
        -   [ ] All comments should have their github username and github profile picture along with it
        -   [ ] For all posts at the top have my name and the admin's profile picture via their github profile picture