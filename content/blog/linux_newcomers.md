+++
title = "Linux for Newcomers"
date = 2020-10-05
updated = 2020-10-07
description = "What to do and install after installing Linux"
+++
What to do and install after installing Linux

# KDE Connect / GSConnect
Connect your phone to your KDE or Gnome desktop. It can:
 - share notifications
 - transfer files
 - transfer browser tabs
 - control your mouse and keyboard from your phone
 - control media both ways
 - control slideshows
 - run custom commands

You need to install both the app and the desktop application to get it to work.
<span class="button-row">
  [KDE Connect](https://kdeconnect.kde.org/)
  [GS Connect](https://extensions.gnome.org/extension/1319/gsconnect/)
</span>

# Flatpak
Flatpak is the best and easiest way to install a lot of apps that 
complements your distribution's standard package manager. I
recommend distro's that support Flatpak out of the box (e.g.
Pop!_OS). Install Flatseal to manage the permissions of Flatpak
apps. Snap is very similar to Flatpak and is also pretty good.
<span class="button-row">
  [Flatpak Guide](https://itsfoss.com/flatpak-guide/)
  [Flathub](https://flathub.org/home)
</span>

# Gaming
You can install Steam on Linux too. Look up how to use Proton to
run a lot of games that don't support Linux natively. Want to know
whether a game will work well via Proton? Look the game up on
ProtonDB. Lutris is an application that lets you manage and 
install games from multiple sources, such as Steam and GOG.
<span class="button-row">
  [Proton Guide](https://segmentnext.com/2018/12/06/steam-proton-guide/)
  [ProtonDB](https://www.protondb.com/)
  [Lutris](https://lutris.net/)
</span>

# Alternatives to Windows Software
A lot of commercial software, such as Microsoft Office and Adobe
Creative Cloud, is sadly not available on Linux. Luckily there
are plenty of alternatives. A few are listed here. One thing to
note is that these are not always drop-in replacements, many
work slightly differently and take some getting used to.
However, they don't lack much in functionality once yoiu get
used to them.
 - Microsoft Word &rarr; LibreOffice Writer (or OnlyOffice)
 - Microsoft PowerPoint &rarr; LibreOffice Impress (or OnlyOffice)
 - Microsoft Excel &rarr; LibreOffice Calc (or OnlyOffice)
 - Abobe Illustrator &rarr; Inkscape
 - Abobe Premiere &rarr; DaVinci Resolve (not open source), KDEnlive (open source)
 - Adobe AfterEffects &rarr; DaVinci Resolve (not open source), Blender
 - Adobe Photoshop &rarr; GIMP (photo manipulation), Krita (drawing)
 - Adobe Reader &rarr; Okular or Evince
 - Autodesk Maya &rarr; Blender

For more alternatives, check out [AlternativeTo](https://alternativeto.net).

# Command Line
There's no way around it: if you're using Linux, you have to use
the command line sometimes. In most distributions, the standard
shell is Bash, which is pretty good. Look up some tutorials to
familiarize yourself with the most common commands:
 - <code>ls</code>: list files in directory
 - <code>mkdir</code>: make a new directory
 - <code>cd</code>: change directory
 - <code>mv</code>: move files
 - <code>cp</code>: copy files
 - <code>rm</code>: remove files
 - <code>cat</code>: show contents of a file and join input from multiple files
 - <code>less</code>: show content of a file with a nicer interface than <code>cat</code>
 - <code>pwd</code>: show present working directory
 - <code>apt</code>: install, update and remove software (on Debian derivatives, such as Ubuntu)

A more in-depth guide can be found at the link below.
<span class="button-row">
  [Bash Guide for Beginners](https://towardsdatascience.com/basics-of-bash-for-beginners-92e53a4c117a)
</span>

There are some optional programs which can be really helpful, or just fun:
 - <code>bat</code>: better <code>cat</code>/<code>less</code>
 - <code>ripgrep</code>: search the content of many files really quickly
 - <code>exa</code>: better <code>ls</code>
 - <code>nnn</code>: command line file manager

If you are fed up with Bash, try other shells! Here are a few examples:
 - Zsh: basically Bash with extra features
 - Fish: very user friendly
 - Nushell: more experimental, but really cool

# Password Manager
Everyone should be using a password manager, no matter what
operating system you're on. I chose my password manager based 
on the following criteria:
 - must be well-established
 - must be open source
 - must have clients on all major platforms (Linux, Windows, Mac
   OSX, Android, iOS, Firefox & Chrome)

The first two criteria are for security reasons, The last criterium is just
convenience, as I want it to work on all platforms I use currently
and I might use in the future. I ended up using Bitwarden,
essentially the best (open source) password manager around.

KeePass is a good locally hosted option, especially with the 
KeePassXC frontend.
<span class="button-row">
  [Bitwarden](https://bitwarden.com)
  [KeePassXC](https://keepassxc.org/)
</span>

# More Awesome Linux Stuff
There is a lot more to explore. A good place to start is the
[Awesome Linux Software list](https://github.com/luong-komorebi/Awesome-Linux-Software).
