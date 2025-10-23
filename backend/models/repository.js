export class Repository {
  constructor(data) {
    this.id = data.id;
    this.repo_url = data.repo_url;
    this.repo_name = data.repo_name;
    this.notebooks = data.notebooks || [];
    this.created_date = data.created_date || new Date().toISOString();
  }
  
  toJSON() {
    return {
      id: this.id,
      repo_url: this.repo_url,
      repo_name: this.repo_name,
      notebooks: this.notebooks,
      created_date: this.created_date
    };
  }
}