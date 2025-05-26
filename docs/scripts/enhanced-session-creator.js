    });

    const templateChoice = await this.prompt('Choose template (1-6): ');
    const templateName = Object.keys(this.templates)[parseInt(templateChoice) - 1];
    const template = this.templates[templateName];

    if (!template) {
      throw new Error('Invalid template selection');
    }

    console.log(`\nUsing template: ${templateName}\n`);

    // Get template-specific inputs
    const sessionId = await this.promptSessionId();
    const focus = await this.promptWithDefault('Focus: ', template.focus);
    const achievements = await this.promptArray('Achievements (comma-separated): ');
    const blockers = await this.promptArray('Blockers (comma-separated, or "none"): ');
    const nextSteps = await this.promptArray('Next steps (comma-separated): ');
    const duration = parseInt(await this.prompt('Duration (minutes): '));

    return {
      sessionId,
      timestamp: new Date().toISOString(),
      developer: 'harshit-codes',
      status: 'completed',
      focus,
      achievements,
      blockers,
      nextSteps,
      filesChanged: [],
      learnings: [],
      notes: `Created using ${templateName} template`,
      duration,
      tags: template.tags || [],
      priority: template.priority || 'medium',
      complexity: template.complexity || 'moderate',
      relatedSessions: [],
      metadata: {
        version: "2.0.0",
        toolsUsed: this.inferTools(focus, achievements.join(' ')),
        environment: "development",
        codebaseSize: 115,
        testsCovered: false
      }
    };
  }

  /**
   * Full interactive creation
   */
  async fullInteractiveCreation() {
    console.log('\n🔧 Full Interactive Creation\n');

    const sessionId = await this.promptSessionId();
    const focus = await this.prompt('Focus area: ');
    const achievements = await this.promptArray('Achievements (comma-separated): ');
    const blockers = await this.promptArray('Blockers (comma-separated, or "none"): ');
    const nextSteps = await this.promptArray('Next steps (comma-separated): ');
    const filesChanged = await this.promptFiles('Files changed (comma-separated): ');
    const learnings = await this.promptArray('Key learnings (comma-separated): ');
    const notes = await this.prompt('Additional notes: ');
    const duration = parseInt(await this.prompt('Duration (minutes): '));
    
    // Enhanced prompts with suggestions
    const tags = await this.promptTags('Tags: ', this.suggestTags(focus, achievements.join(' ')));
    const priority = await this.promptChoice('Priority', ['low', 'medium', 'high', 'critical']);
    const complexity = await this.promptChoice('Complexity', ['simple', 'moderate', 'complex', 'expert']);
    const testsCovered = await this.promptBoolean('Tests covered? (y/n): ');

    return {
      sessionId,
      timestamp: new Date().toISOString(),
      developer: 'harshit-codes',
      status: 'completed',
      focus,
      achievements,
      blockers,
      nextSteps,
      filesChanged,
      learnings,
      notes,
      duration,
      tags,
      priority,
      complexity,
      relatedSessions: [],
      metadata: {
        version: "2.0.0",
        toolsUsed: this.inferTools(focus, achievements.join(' ')),
        environment: "development",
        codebaseSize: 115,
        testsCovered
      }
    };
  }

  /**
   * Smart session ID generation
   */
  async promptSessionId() {
    const today = new Date().toISOString().split('T')[0];
    const suggestion = `${today}-session-work`;
    
    const sessionId = await this.promptWithDefault('Session ID: ', suggestion);
    
    // Check for duplicates
    if (this.sessionManager.findSession(sessionId)) {
      console.log('⚠️  Session ID already exists. Please choose a different one.');
      return await this.promptSessionId();
    }
    
    return sessionId;
  }

  /**
   * Suggest tags based on content
   */
  suggestTags(focus, achievements) {
    const allText = `${focus} ${achievements}`.toLowerCase();
    const suggestions = [];

    const tagKeywords = {
      'feature': ['feature', 'new', 'add', 'implement', 'create'],
      'bugfix': ['fix', 'bug', 'error', 'resolve', 'debug'],
      'refactor': ['refactor', 'clean', 'improve', 'optimize'],
      'documentation': ['doc', 'readme', 'guide', 'documentation'],
      'testing': ['test', 'validation', 'verify', 'coverage'],
      'deployment': ['deploy', 'publish', 'release', 'npm'],
      'analysis': ['analysis', 'analyze', 'review', 'assess'],
      'security': ['security', 'validation', 'auth', 'token'],
      'integration': ['integration', 'connect', 'api', 'mcp'],
      'setup': ['setup', 'install', 'configure', 'init'],
      'migration': ['migration', 'migrate', 'convert'],
      'automation': ['automation', 'workflow', 'github actions', 'ci/cd']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        suggestions.push(tag);
      }
    }

    return suggestions;
  }

  /**
   * Infer tools used based on content
   */
  inferTools(focus, achievements) {
    const content = `${focus} ${achievements}`.toLowerCase();
    const tools = new Set();

    const toolKeywords = {
      'TypeScript': ['typescript', 'ts'],
      'JavaScript': ['javascript', 'js'],
      'Node.js': ['node', 'npm'],
      'React': ['react', 'jsx'],
      'Git': ['git', 'commit', 'push'],
      'GitHub': ['github', 'actions'],
      'JSON': ['json'],
      'CSV': ['csv'],
      'HuggingFace': ['huggingface', 'hf'],
      'Pinecone': ['pinecone'],
      'MCP': ['mcp', 'inspector'],
      'SSE': ['sse', 'server-sent'],
      'API': ['api', 'endpoint'],
      'Testing': ['test', 'jest']
    };

    for (const [tool, keywords] of Object.entries(toolKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tools.add(tool);
      }
    }

    return Array.from(tools);
  }

  /**
   * Infer tags based on content
   */
  inferTags(focus, achievements) {
    return this.suggestTags(focus, achievements).slice(0, 3); // Top 3 tags
  }

  /**
   * Show session summary after creation
   */
  showSessionSummary(sessionData) {
    console.log('\n📋 Session Summary:');
    console.log(`ID: ${sessionData.sessionId}`);
    console.log(`Focus: ${sessionData.focus}`);
    console.log(`Achievements: ${sessionData.achievements.length}`);
    console.log(`Duration: ${sessionData.duration} minutes`);
    console.log(`Tags: ${sessionData.tags.join(', ')}`);
    console.log(`Priority: ${sessionData.priority}`);
    console.log(`Complexity: ${sessionData.complexity}`);
  }

  // Enhanced prompt methods
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async promptWithDefault(question, defaultValue) {
    const fullQuestion = `${question}(default: ${defaultValue}): `;
    const answer = await this.prompt(fullQuestion);
    return answer || defaultValue;
  }

  async promptChoice(question, options) {
    console.log(`${question} options: ${options.join(', ')}`);
    const answer = await this.prompt(`${question}: `);
    return options.includes(answer) ? answer : options[0];
  }

  async promptArray(question) {
    const answer = await this.prompt(question);
    if (!answer || answer.toLowerCase() === 'none') return [];
    
    return answer.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  async promptFiles(question) {
    const filesString = await this.prompt(question);
    if (!filesString) return [];

    return filesString.split(',').map(filePath => ({
      path: filePath.trim(),
      type: "modified",
      description: ""
    }));
  }

  async promptTags(question, suggestions = []) {
    const validTags = [
      'feature', 'bugfix', 'refactor', 'documentation', 
      'testing', 'deployment', 'analysis', 'research',
      'optimization', 'security', 'integration', 'setup',
      'migration', 'validation', 'automation', 'tooling'
    ];
    
    if (suggestions.length > 0) {
      console.log(`Suggested tags: ${suggestions.join(', ')}`);
    }
    console.log(`Valid tags: ${validTags.join(', ')}`);
    
    const tagsString = await this.prompt(question);
    if (!tagsString) return suggestions;

    const inputTags = tagsString.split(',').map(tag => tag.trim());
    return inputTags.filter(tag => validTags.includes(tag));
  }

  async promptBoolean(question) {
    const answer = await this.prompt(question);
    return ['y', 'yes', 'true', '1'].includes(answer.toLowerCase());
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';

  switch (command) {
    case 'create':
    case 'add':
      const creator = new EnhancedSessionCreator();
      await creator.createSession();
      break;

    case 'help':
      console.log(`
Enhanced Session Creator

Usage:
  node enhanced-session-creator.js [command]

Commands:
  create/add     Create new session interactively (default)
  help           Show this help message

Features:
  🚀 Quick creation for rapid entry
  📋 Template-based creation with presets
  🔧 Full interactive mode with all fields
  💡 Smart suggestions for tags and tools
  ✅ Validation with helpful feedback
  📊 Context from recent sessions

Examples:
  node enhanced-session-creator.js create
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node enhanced-session-creator.js help" for usage information');
      process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { EnhancedSessionCreator };
