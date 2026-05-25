const fs = require('fs').promises;
const path = require('path');

class FileService {
  constructor(filename) {
    this.filePath = path.join(__dirname, '../data', `${filename}.json`);
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
    // If the file doesn't exist then create it with an empty array to stop the app from crashing.
      if (error.code === 'ENOENT') {    // ENOENT means "Error No Entry" means the file doesn't exist. 
        await this.write([]);   //why this.write([]) why not simply return []? beacuse we want to create the file if it doesn't exist, and we create an array inside it instead of creating just the file because the next time if we try to read the file it will throw a JSON parse error because it will be empty and not contain valid JSON. By writing an empty array to the file, we ensure that it contains valid JSON and can be read without errors in the future.
        return [];  // why return [] after writing? because we want to return an empty array to the caller, since the file is now created and contains an empty array. If we don't return [] here, the caller will get undefined, which might cause issues in the rest of the code that expects an array.
      }
      throw new Error(`Failed to read ${this.filePath}: ${error.message}`); 
    }
  }

  async write(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to write to ${this.filePath}: ${error.message}`);
    }
  }

  async findById(id) {
    const items = await this.read();
    return items.find(item => item.id === id);
  }

  async create(item) {
    const items = await this.read();
    items.push(item);
    await this.write(items);
    return item;
  }

  async update(id, updates) {
    const items = await this.read();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    await this.write(items);
    return items[index];
  }

  async delete(id) {
    const items = await this.read();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) return false;
    
    await this.write(filtered);
    return true;
  }
}

module.exports = FileService;