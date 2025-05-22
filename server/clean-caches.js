// clean-caches.js - Utility to remove cached equation explanations
const fs = require('fs').promises;
const path = require('path');

async function cleanCaches() {
  console.log('=== Equation Explanation Cache Cleaner ===');
  
  // Define cache directories
  const serverCacheDir = path.join(__dirname, 'explanations-cache');
  const publicCacheDir = path.join(__dirname, '..', 'public', 'explanations-cache');
  
  let serverFilesDeleted = 0;
  let publicFilesDeleted = 0;
  
  // Clean server cache
  try {
    console.log(`\nCleaning server cache directory: ${serverCacheDir}`);
    const files = await fs.readdir(serverCacheDir);
    
    if (files.length === 0) {
      console.log('Server cache is already empty.');
    } else {
      for (const file of files) {
        // Only delete .json files to be safe
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(serverCacheDir, file));
          serverFilesDeleted++;
          process.stdout.write('.');
        }
      }
      console.log(`\nDeleted ${serverFilesDeleted} cached explanation${serverFilesDeleted !== 1 ? 's' : ''} from server cache.`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Server cache directory does not exist yet. Nothing to clean.');
    } else {
      console.error('Error cleaning server cache:', error.message);
    }
  }
  
  // Clean public cache
  try {
    console.log(`\nCleaning public cache directory: ${publicCacheDir}`);
    const files = await fs.readdir(publicCacheDir);
    
    if (files.length === 0) {
      console.log('Public cache is already empty.');
    } else {
      for (const file of files) {
        // Only delete .json files to be safe
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(publicCacheDir, file));
          publicFilesDeleted++;
          process.stdout.write('.');
        }
      }
      console.log(`\nDeleted ${publicFilesDeleted} cached explanation${publicFilesDeleted !== 1 ? 's' : ''} from public cache.`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Public cache directory does not exist yet. Nothing to clean.');
    } else {
      console.error('Error cleaning public cache:', error.message);
    }
  }
  
  const totalDeleted = serverFilesDeleted + publicFilesDeleted;
  console.log(`\n=== Cache cleaning completed ===`);
  console.log(`Total files deleted: ${totalDeleted}`);
  
  if (totalDeleted > 0) {
    console.log('\nAll cached equation explanations have been removed.');
    console.log('New explanations will be generated on demand.');
  } else {
    console.log('\nNo cached explanations were found to delete.');
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  cleanCaches().catch(error => {
    console.error('Error in cleanCaches:', error);
  });
}

module.exports = { cleanCaches };
