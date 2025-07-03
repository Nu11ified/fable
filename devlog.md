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

-   [ ] **Setup & Theming**
    -   [ ] Install and configure `shadcn/ui`.
    -   [ ] Implement the core theme and light/dark mode toggle.

-   [ ] **Design System & Style Guide**
    <details>
      <summary>Click to expand Style Guide</summary>
    
      The resume website will feature a clean, modern, and minimalist design aesthetic, built using the shadcn/ui component library. The layout will be single-column and easily scannable, with clear headings and generous white space to ensure readability. The typography will be based on a sans-serif font, such as Inter, for a professional and accessible look. The color scheme will be simple and elegant, with a neutral primary color and a single accent color for links and highlights. A prominent feature will be a light and dark mode toggle, allowing users to switch between a light theme with dark text on a light background and a dark theme with light text on a dark background, ensuring a comfortable viewing experience in any lighting condition.
    
      Sections across the site, such as 'Experience' on the resume or the main content of a blog post, will be clearly defined using subtle separators and generous vertical spacing to maintain a clean, uncluttered layout. List-based pages, including the main Portfolio and Blog views, will utilize a responsive grid of cards. Each card will be minimalist, featuring a thin border, rounded corners, and a subtle box-shadow that intensifies on hover for user feedback. The internal structure of a card will be consistent, typically containing a heading, a short description, and relevant metadata presented as Badge components (e.g., technologies used, post category). The admin panel will leverage these cards extensively for content management, with each card representing an item like a project or post and containing action buttons for 'Edit' and 'Delete'. Blog post cards will also uniquely showcase the most upvoted user comment directly on the card itself, providing a snapshot of community engagement.
    </details>

## Phase 3: Page & Component Implementation

-   [ ] **Admin Panel**
    -   [ ] Build Resume management interface.
    -   [ ] Build Portfolio management interface.
    -   [ ] Build Blog management interface.
    -   [ ] Build Comment & User management interface.

-   [ ] **Public-Facing Pages**
    -   [ ] **Resume Page**
        -   [ ] Create main page layout.
        -   [ ] Build `Experience` section component.
        -   [ ] Build `Education` section component.
        -   [ ] Build `Skills` section component.
    -   [ ] **Portfolio Page**
        -   [ ] Build portfolio list view with project cards.
        -   [ ] Build detailed project view page.
    -   [ ] **Blog Page**
        -   [ ] Build blog list view with post cards.
        -   [ ] Build individual blog post page.
        -   [ ] Implement comment section with sorting logic.