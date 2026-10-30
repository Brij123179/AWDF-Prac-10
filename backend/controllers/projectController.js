import Project from '../models/projectModel.js';

export const projectController = {
  getAllProjects: async (req, res, next) => {
    try {
      const { category, status, search } = req.query;
      const query = {};

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && search.trim() !== '') {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      let projects = await Project.find(query).sort({ createdAt: -1 });

      // If empty, auto-seed with realistic projects
      if (projects.length === 0 && !search && !category && !status) {
        const defaultProjects = [
          {
            title: 'React Code Splitting & Performance Optimizer',
            description: 'Implement dynamic import(), React.lazy() and Suspense fallback to slash bundle size by 40%.',
            category: 'Frontend',
            status: 'In Progress',
            progress: 75,
            teamMembers: ['Frontend Architect', 'Performance Lead'],
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'RESTful Microservices & JWT Middleware Pipeline',
            description: 'Secure Express API gateway with Bearer tokens, rate limiting, and request sanitization.',
            category: 'Backend',
            status: 'Completed',
            progress: 100,
            teamMembers: ['Backend Engineer', 'Security Analyst'],
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Lighthouse CI & Core Web Vitals Pipeline',
            description: 'Automated GitHub Actions step measuring FCP, LCP, CLS, and TBT across production builds.',
            category: 'DevOps',
            status: 'Planning',
            progress: 25,
            teamMembers: ['DevOps Specialist'],
            dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Offline Service Worker & Asset Caching',
            description: 'PWA integration using Workbox to cache lazy-loaded chunks for instant subsequent page renders.',
            category: 'FullStack',
            status: 'In Progress',
            progress: 60,
            teamMembers: ['FullStack Engineer'],
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          }
        ];
        projects = await Project.insertMany(defaultProjects);
      }

      res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  },

  createProject: async (req, res, next) => {
    try {
      const { title, description, category, status, progress, teamMembers, dueDate } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Project title is required'
        });
      }

      const project = await Project.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category || 'Frontend',
        status: status || 'Planning',
        progress: Number(progress) || 0,
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [teamMembers || 'Lead Developer'],
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  updateProject: async (req, res, next) => {
    try {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProject: async (req, res, next) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
