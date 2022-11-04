+++
title = "Deep dive into Python Package Management"
date = 2022-06-10
description = "Exploring different ways to solve the problem of installing Python packages"
draft = true
+++

Installing a Python package is easy, right? Just run

```bash
pip install package-that-you-want-to-install
```

and voila, you got yourself that package.

But hold on, because this will install that package on your system-wide Python installation. Which has many drawbacks:

- Different projects cannot depend on different versions of this package.
- `pip install` will install the latest version, making this unreproducible.
- We cannot choose the Python version for a project, we're stuck with the system-wide version.

There is no shortage of options to fix (some of) these problems. In this post, I will explore the following options:

- `virtualenv`
- `pyenv`
- `pipenv`
- `poetry`
- `conda`
- `PDM`

# virtualenv

Virtual environments are the built-in solution for installing packages for a project. The idea is simple: instead of installing into the global folder, we install the dependencies into a folder alongside the project and we'll tell Python to look there for packages.

Let's try it out:

```bash
# Create a virtual environment
❯ python -m venv cool-venv
```

This creates a new folder `cool-venv`. Let's see what's in it:

```
❯ ls cool-venv
bin  include  lib  lib64  pyvenv.cfg

❯ ls cool-venv/bin
activate  activate.csh  activate.fish  Activate.ps1  pip  pip3  pip3.10  python  python3  python3.10

❯ ls cool-venv/bin/python -l
lrwxrwxrwx 1 terts terts 15 10 jun 14:56 cool-venv/bin/python -> /usr/bin/python
```

Okay, what does that mean? It has made a folder with a `bin` and a `lib` folder. `bin` contains links to the Python executable that created the venv (`/usr/bin/python`). The whole structure mirrors how Python itself is installed. We can now activate this environment:

```
❯ source cool-venv/bin/activate
(cool-venv) ❯
```

Now, we can install a package of our choice:

```
(cool-venv) ❯ pip install cowsay
Collecting cowsay
  Downloading cowsay-4.0-py2.py3-none-any.whl (24 kB)
Installing collected packages: cowsay
Successfully installed cowsay-4.0
```

Now let's see what that's done.

```
(cool-venv) ❯ ls cool-venv/lib/python3.10/site-packages/
cowsay  cowsay-4.0.dist-info  _distutils_hack  distutils-precedence.pth  pip  pip-22.0.4.dist-info  pkg_resources  setuptools  setuptools-58.1.0.dist-info
```

Cool! It's installed in the venv and therefore not accessible for the system-wide Python or other virtual environments.


