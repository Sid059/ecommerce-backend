
```
services/
├── fileService.js   # JSON read/write operations

```

So this file is the **data layer** of your application.

* * * * *

What is `fileService.js`?
=========================

Simple Explanation
------------------

`fileService.js` is a reusable utility class that handles all interaction with your JSON files.

Instead of writing this code again and again:

```
readFile()
writeFile()
JSON.parse()
JSON.stringify()
find item
update item
delete item

```

you centralize everything into one reusable service.

* * * * *

Real Purpose in YOUR Project
============================

Your backend is NOT using MongoDB or MySQL.

Instead, your project stores data in JSON files:

```
data/
├── users.json
├── products.json
├── carts.json
├── orders.json
└── wishlists.json

```

That means your JSON files are acting like a mini database.

So `fileService.js` becomes your:

"Fake Database Layer"
=====================

It provides CRUD operations:

| Operation | Meaning |
| --- | --- |
| Create | Add new data |
| Read | Get data |
| Update | Modify data |
| Delete | Remove data |

* * * * *

Why This File Is VERY Important
===============================

Without `fileService.js`, every controller would need to manually:

-   open files

-   parse JSON

-   update arrays

-   save files again

-   handle errors

That would create huge code duplication.

Instead:

```
const userService = new FileService('users');

```

Now every controller can simply call:

```
userService.create()
userService.findById()
userService.update()

```

Very clean architecture.

* * * * *

How This Fits Into Backend Architecture
=======================================

Your architecture looks like this:

```
Route → Controller → Service → JSON File

```

Example:

```
POST /auth/register
        ↓
authController.js
        ↓
fileService.js
        ↓
users.json

```

So:

-   Controller handles request/response

-   Service handles data operations

-   JSON file stores the data

This separation is extremely important in backend development.

* * * * *

Now Let's Understand the Code Line by Line
==========================================

* * * * *

1\. Importing Modules
=====================

```
const fs = require('fs').promises;
const path = require('path');

```

* * * * *

`fs`
----

`fs` means:

File System module
==================

Node.js gives this built-in module to work with files.

You use it for:

-   reading files

-   writing files

-   deleting files

-   creating folders

* * * * *

Why `.promises`?
----------------

Without promises:

```
fs.readFile('file.txt', callback)

```

With promises:

```
await fs.readFile('file.txt')

```

This makes async code cleaner.

* * * * *

`path`
------

The `path` module helps safely create file paths.

Instead of:

```
'../data/users.json'

```

you use:

```
path.join(...)

```

because paths behave differently on Windows/Mac/Linux.

This avoids bugs.

* * * * *

2\. Creating the Class
======================

```
class FileService {

```

This creates a reusable blueprint.

Think of it like:

> "A machine that can manage any JSON file."

* * * * *

3\. Constructor
===============

```
constructor(filename) {
  this.filePath = path.join(__dirname, '../data', `${filename}.json`);
}

```

This runs automatically when you create an object.

Example:

```
const userService = new FileService('users');

```

Now:

```
this.filePath

```

becomes:

```
/data/users.json

```

* * * * *

Understanding `__dirname`
=========================

`__dirname` means:

> current folder location

If `fileService.js` is inside:

```
services/fileService.js

```

then:

```
__dirname

```

points to:

```
/services

```

Then:

```
path.join(__dirname, '../data', 'users.json')

```

becomes:

```
/data/users.json

```

* * * * *

4\. `read()` Method
===================

***read() method:***
- Reads the file from disk (server-side).
- The file contains JSON data as a string (for example: [{"id":1,"name":"Alice"}]).
- JSON.parse(data) converts this string into a JavaScript object or array, so your server code can work with it easily.
- This parsed object/array is used inside the server (not sent directly to the client).



```
async read() {

```

This method reads data from the JSON file.

* * * * *

Step-by-step
------------

### Read the file

```
const data = await fs.readFile(this.filePath, 'utf-8');

```

Example:

```
[
  {
    "id": "1",
    "name": "Phone"
  }
]

```

But this is still TEXT.

* * * * *

Convert JSON text into JavaScript array/object
----------------------------------------------

```
return JSON.parse(data);

```

Now it becomes:

```
[
  {
    id: '1',
    name: 'Phone'
  }
]

```

Now JavaScript can work with it.

* * * * *

Error Handling
==============

```
catch (error)

```

This catches problems.

* * * * *

Important Case: `ENOENT`
------------------------

```
if (error.code === 'ENOENT')

```

`ENOENT` means:

File does not exist
===================

Example:

```
users.json not found

```

* * * * *

Then this happens
-----------------

```
await this.write([]);
return [];

```

It creates an empty JSON array:

```
[]

```

This is smart because your app won't crash if the file doesn't exist yet.

* * * * *

5\. `write()` Method
====================
***write() method:***
- Takes a JavaScript object or array and converts it to a JSON string using JSON.stringify.
- Writes this string to the file, so it can be read later.

```
async write(data)

```

This saves data into the JSON file.

* * * * *

Main Logic
----------

```
await fs.writeFile(
  this.filePath,
  JSON.stringify(data, null, 2)
);

```

* * * * *

`JSON.stringify()`
==================

Converts JavaScript object → JSON text.

Example:

```
[{ name: 'Phone' }]

```

becomes:

```
[
  {
    "name": "Phone"
  }
]

```

* * * * *

Why `null, 2`?
==============

```
JSON.stringify(data, null, 2)

```

adds formatting.

Without it:

```
[{"name":"Phone"}]

```

With it:

```
[
  {
    "name": "Phone"
  }
]

```

Much easier to read.

* * * * *

6\. `findById(id)`
==================

```
async findById(id)

```

Finds one item by ID.

* * * * *

Flow
----

```
const items = await this.read();

```

Gets all items.

Then:

```
return items.find(item => item.id === id);

```

Searches the array.

* * * * *

Example
-------

If products.json contains:

```
[
  { "id": "1", "name": "Phone" },
  { "id": "2", "name": "Laptop" }
]

```

Then:

```
findById("2")

```

returns:

```
{ id: "2", name: "Laptop" }

```

* * * * *

7\. `create(item)`
==================

```
async create(item)

```

Adds new data.

* * * * *

Flow
----

### Read current items

```
const items = await this.read();

```

* * * * *

### Add new item

```
items.push(item);

```

* * * * *

### Save updated array

```
await this.write(items);

```

* * * * *

### Return created item

```
return item;

```

* * * * *

Example
=======

Before:

```
[]

```

After:

```
[
  {
    "id": "1",
    "name": "Phone"
  }
]

```

* * * * *

8\. `update(id, updates)`
=========================

This updates an existing item.

* * * * *

Find item index
---------------

```
const index = items.findIndex(item => item.id === id);

```

Why `findIndex`?

Because we need the position in the array.

Example:

```
index = 1

```

* * * * *

If item doesn't exist
=====================

```
if (index === -1) return null;

```

`-1` means not found.

* * * * *

Update object
=============

```
items[index] = {
  ...items[index],
  ...updates
};

```

This is VERY important.

* * * * *

Spread Operator Explanation
===========================

Suppose original object:

```
{
  id: 1,
  name: 'Phone',
  price: 500
}

```

Updates:

```
{
  price: 450
}

```

Result:

```
{
  id: 1,
  name: 'Phone',
  price: 450
}

```

So it keeps old values and replaces changed ones.

* * * * *

9\. `delete(id)`
================

Deletes an item.

* * * * *

Filter items
------------

```
const filtered = items.filter(item => item.id !== id);

```

Creates a new array WITHOUT the matching item.

* * * * *

Example
=======

Before:

```
[
  { id: 1 },
  { id: 2 }
]

```

Delete id 1:

```
[
  { id: 2 }
]

```

* * * * *

Detect if nothing was deleted
=============================

```
if (filtered.length === items.length)

```

Means:

-   same number of items

-   nothing removed

So:

```
return false;

```

* * * * *

Save updated array
==================

```
await this.write(filtered);

```

* * * * *

Exporting
=========

```
module.exports = FileService;

```

Makes this class usable in other files.

Example:

```
const FileService = require('../services/fileService');

```

* * * * *

Senior Developer Perspective
============================

This file demonstrates several important backend concepts:

| Concept | Why Important |
| --- | --- |
| Separation of concerns | Keeps controllers clean |
| Reusability | One service works for all files |
| Async programming | Non-blocking I/O |
| Error handling | Prevents crashes |
| Data abstraction | Controllers don't care HOW data is stored |
| CRUD architecture | Foundation of APIs |

* * * * *

One Important Real-World Note
=============================

This approach is PERFECT for:

-   learning backend

-   portfolio projects

-   frontend-focused projects

-   small demos

BUT:

In production systems:

-   JSON files are slow

-   multiple users can corrupt writes

-   no indexing

-   no concurrency protection

So real applications use databases like:

-   MongoDB

-   PostgreSQL

-   MySQL

But for your project, this is an excellent choice because it lets you focus on:

-   API design

-   authentication

-   backend structure

-   frontend integration

without database complexity yet.