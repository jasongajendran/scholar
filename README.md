# Scholar Lexicon 📚🔬

An authoritative, intermediate-to-advanced academic vocabulary and expression guide engineered for Life Science researchers, peer reviewers, and journal publication specialists assisting authors with scientific manuscripts.

---

## 🌟 Key Features

- **Complete A–Z Alphabetical Index**: Full coverage across all 26 letters (A–Z) featuring **25+ curated academic & scientific terms per letter**.
- **Contextual In-Situ Examples**: Highlighting real-world usage in both manuscript contexts and peer-review conference/editorial discussions.
- **Etymology & Pronunciation**: Phonetic transcriptions and linguistic origin details for every term.
- **Search & Advanced Filtering**: Filter vocabulary by tags (Life Sciences, Peer Review, Manuscript Editing, Editorial Meetings), parts of speech, or search keywords.
- **Bookmarks & Practice Tools**: Save key words for review, test retention with interactive flashcards, or take customizable vocabulary quizzes.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔧 Fixing the GitHub Actions Deployment Error

If your GitHub Action failed with:
`HttpError: Resource not accessible by integration - Create Pages site failed`

This happens because GitHub limits default workflow permissions on new repositories. Follow these **2 quick steps** in your GitHub repository settings to resolve it:

### Step 1: Enable Read and Write Workflow Permissions
1. Go to your repository on GitHub.
2. Click **Settings** (top navigation bar of your repo).
3. In the left sidebar, expand **Actions** → click **General**.
4. Scroll down to the **Workflow permissions** section.
5. Select **Read and write permissions**.
6. Click **Save**.

### Step 2: Set GitHub Pages Source to "GitHub Actions"
1. In repository **Settings**, click **Pages** in the left sidebar (under "Code and automation").
2. Under **Build and deployment** → **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").

### Step 3: Re-run the Failed Action
1. Go to the **Actions** tab in your repository.
2. Select the failed **Deploy to GitHub Pages** run.
3. Click **Re-run all jobs** in the top right.

---

## 📄 License

MIT License.
