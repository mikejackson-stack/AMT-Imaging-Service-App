# Reset a forgotten Linux root password (OS disk, rescue mode, or GRUB)

**Type:** AMT field guide. Generic Linux only. This is not an OEM MRI or CT service procedure, and it is not a substitute for the OEM service manual.
**Source:** Public Linux recovery practice: live/rescue disk chroot, RHEL-family install-disk rescue mode, and GRUB `rd.break` / `init=/bin/bash`. Written 7 Oct 2026 for AMT field use.
**System:** Linux host or console computers. The steps are the same on a scanner host, a recon box, or any other Linux PC the customer has authorized you to service.

Use this to reset root when the linux password is forgotten. It covers an OS disk (live or rescue USB or DVD, or the system's own install disk), rescue mode, and a GRUB edit. A single user boot is included because it usually still asks for the password.

---

## Read this first

- Do this only on equipment the customer has authorized you to service. Follow site IT and security policy, and follow the OEM service documentation when the OEM has a procedure for this host.
- On an OEM-managed medical system, check the OEM procedure before you reset anything. An unofficial reset can affect support, warranty, or regulatory status.
- Never do this during patient scanning, and never while a patient is on the table. These steps reboot the host computer.
- Back up before changing anything. If the disk mounts, copy `/etc/passwd`, `/etc/shadow`, and `/etc/group` onto the boot USB only, so you can put them back if the reset fails. Delete those copies before you leave. Do not copy them to a laptop, a photo, a text, or this app. They contain password hashes.
- Write the original firmware boot order on the service report before you change it. Restore it when you are done.
- Document the change on the service report: that the root password was reset, which method you used, and the time. Record the new credential only where customer policy says credentials go. Never type the new password into this app, a job note, a photo, or a chat.
- Do not edit `/etc/shadow` by hand. Use `passwd`. Hand edits are easy to get wrong and can lock the system.
- This guide does not list OEM service passwords. Do not guess one.

If the disk is encrypted, stop. See Troubleshooting. You cannot reset the login password until the disk is unlocked, and unlocking needs a passphrase the site already has.

---

## Before you start

1. Confirm the customer contact wants this host's root password changed, and that scanning is finished.
2. You need a Linux OS disk: a live or rescue USB or DVD, or the install disk for the same Linux family. A current Ubuntu live image works for the live-disk method. A RHEL, CentOS, Rocky, Alma, or Fedora install image is the right disk for rescue mode on those systems. Match the architecture (almost always 64-bit).
3. Choose **Try** or **live** or **rescue**. Never choose **Install**. An install will erase the host.
4. The key that opens the one-time boot menu or firmware setup is printed on the splash screen. It differs by PC vendor. Common keys are Esc, F2, F9, F10, F12, and Del. Use the key the screen shows. Write down the boot order before you change it.
5. At a live desktop the prompt is usually `$` and commands need `sudo`. At a rescue shell the prompt is usually `#` and you are already root, so leave `sudo` off. If `sudo` is not found, you are already root.

Run `passwd` only after you have entered the installed system (the chroot). If you run it before that, you change the temporary live system only. That password disappears on reboot and the host is unchanged.

---

## Method A — Boot an OS disk and chroot

Use this when you have a live or rescue USB or DVD, including the system's own OS disk booted as a live system.

### 1. Boot the OS disk

Insert the media. Power on and open the one-time boot menu or firmware setup. Boot the USB or DVD. If the menu offers Install, do not pick it.

### 2. Identify the root partition

Open a terminal and list the disks:

`lsblk -f`

`sudo fdisk -l`

`sudo blkid`

You are looking for the installed root filesystem. It is usually the large partition, type ext4, xfs, or btrfs. Skip the small EFI partition (vfat, often a few hundred MB) and a small `/boot` partition.

LVM roots do not show a normal mount until the volume group is active. You may see type `lvm` and, after the next step, a name under `/dev/mapper/`. Read the name from `lsblk`. Do not assume a volume name.

### 3. Activate LVM, if the root volume is not listed

`sudo vgscan`

`sudo vgchange -ay`

`lsblk -f`

If `vgchange` is not found, this live image has no LVM tools. Use a rescue disk from the same Linux family and start again. Do not guess a device path.

### 4. Mount the root filesystem

`sudo mkdir -p /mnt/sysroot`

`sudo mount /dev/mapper/ROOT-LV-NAME /mnt/sysroot`

Replace `/dev/mapper/ROOT-LV-NAME` with the device `lsblk` showed. A plain partition looks like `/dev/sdX1` or `/dev/nvme0n1pX`. The `X` is a placeholder, not a real disk on the scanner.

Confirm you mounted the installed system:

`ls /mnt/sysroot/etc/shadow`

That file must exist. You should also see `bin`, `etc`, `usr`, and `var` in `/mnt/sysroot`. If you see only kernels or a `grub` directory, you mounted `/boot`. If you see an `EFI` directory and little else, you mounted the EFI partition. Unmount and try the next candidate:

`sudo umount /mnt/sysroot`

### 5. Mount a separate /boot if this disk has one

`passwd` works with only root mounted. Mount `/boot` when it is a separate partition so the layout matches the installed system. Read the installed fstab:

`grep boot /mnt/sysroot/etc/fstab`

If fstab or `lsblk` shows a separate `/boot`, mount it:

`sudo mount /dev/BOOT-PARTITION /mnt/sysroot/boot`

If fstab also shows `/boot/efi`, mount that after `/boot`:

`sudo mount /dev/EFI-PARTITION /mnt/sysroot/boot/efi`

Use the devices from `lsblk` and fstab. Skip any path this disk does not have.

### 6. Bind-mount /dev, /proc, and /sys

`sudo mount --bind /dev /mnt/sysroot/dev`

`sudo mount --bind /proc /mnt/sysroot/proc`

`sudo mount --bind /sys /mnt/sysroot/sys`

Also bind `/run` when that directory exists on the live system. Some `passwd` setups want it:

`sudo mount --bind /run /mnt/sysroot/run`

### 7. Enter the installed system

`sudo chroot /mnt/sysroot /bin/bash`

The prompt should change. You are now root on the installed host, not on the live image.

### 8. Set the root password

`passwd root`

Type the new password twice. Nothing echoes. They must match. `passwd root` sets the root account. If the console login is a named account rather than root, read the name from the installed system first (`grep /home/ /etc/passwd`) and run `passwd` with that username. Do not guess an account name, and do not invent an OEM account.

### 9. SELinux relabel (RHEL, CentOS, Rocky, Alma, Fedora)

On those families, a password set from outside the running system gets the wrong SELinux label. The next boot will not accept it until the disk is relabeled. Still inside the chroot:

`touch /.autorelabel`

The leading slash matters. The file must be `/.autorelabel` on the installed root.

If `getenforce` exists and prints `Enforcing` or `Permissive`, create that file. If it prints `Disabled`, you can skip it.

Debian and Ubuntu normally use AppArmor, not SELinux. Skip `/.autorelabel` on those unless `getenforce` shows SELinux is in use.

The next boot can sit on a relabel for a long time and may reboot once more. Let it finish. Do not power off during the relabel.

### 10. Leave, unmount, reboot

`exit`

You are back on the live system. Unmount in reverse order. Skip any path you did not mount:

`sudo umount /mnt/sysroot/run`

`sudo umount /mnt/sysroot/sys`

`sudo umount /mnt/sysroot/proc`

`sudo umount /mnt/sysroot/dev`

`sudo umount /mnt/sysroot/boot/efi`

`sudo umount /mnt/sysroot/boot`

`sudo umount /mnt/sysroot`

On a current live image this one command unmounts the whole tree:

`sudo umount -R /mnt/sysroot`

If umount says the target is busy, you are still inside the chroot or a program has a file open. `exit` the chroot and try again. Do not pull the USB yet.

`sudo reboot`

Remove the OS disk when the firmware starts. Confirm the machine boots the installed disk. Log in with the new password on the host's own keyboard before you leave.

---

## Method B — RHEL-family install disk, rescue mode

Use this when you have the install DVD or USB for a RHEL, CentOS, Rocky, Alma, or Fedora system and you do not want to do the mounts by hand. Use a disk from the same family and a close version so it understands the installed LVM and filesystem.

This menu is not on an Ubuntu live disk. For Ubuntu, use Method A.

### 1. Boot the install disk and open rescue mode

Boot the install media from the one-time boot menu. At the boot menu choose **Troubleshooting**, then the line that says **Rescue a ... system** (the name matches the distro: Rescue a Red Hat Enterprise Linux system, Rescue a CentOS system, and so on).

### 2. Let it mount the installed system

When it asks how to mount the installation, choose **Continue** (option 1). That mounts the installed system read-write at `/mnt/sysimage`.

Do not choose **Read-only** if you need to change the password. A read-only mount makes `passwd` fail.

Choose **Skip** only if you will identify and mount the disk yourself with Method A.

If it says it cannot find a Linux installation, stop. The disk may be the wrong one, an LVM volume the image cannot see, or an encrypted disk. Do not install over it.

### 3. chroot, set the password, relabel

The rescue shell is already root.

`chroot /mnt/sysimage`

`passwd root`

`touch /.autorelabel`

`exit`

`exit`

The first `exit` leaves the chroot. The second leaves the rescue shell. Reboot, remove the media, and wait for the SELinux relabel to finish. Then log in and confirm the new password.

You do not repeat the Method A bind mounts when the rescue menu says the system is mounted at `/mnt/sysimage`.

---

## Method C — No disk: edit GRUB

Use this only when the GRUB menu lets you edit the kernel line. If GRUB asks for a username or password before you can press `e`, the menu is password-protected. Method C will not work. Use an OS disk (Method A or Method B).

The edit lasts for this boot only. It is not saved.

### rd.break (RHEL 7 and later, and other systemd systems that use it)

### 1. Open the kernel line

Reboot. Stop the GRUB countdown (any key except Enter, or the key the menu shows). Select the normal kernel entry. Press `e`.

### 2. Add rd.break

Find the line that starts with `linux`, `linux16`, or `linuxefi`. Go to the end of that line. Add a space and:

`rd.break`

Do not delete `root=` or the rest of the line.

### 3. Boot the edited line

Press Ctrl+x. Some firmware uses F10 instead. You should get a shell, often `switch_root:/#`. The installed root is mounted read-only at `/sysroot`.

### 4. Remount, chroot, set the password, relabel

`mount -o remount,rw /sysroot`

`chroot /sysroot`

`passwd root`

`touch /.autorelabel`

`exit`

`exit`

The second `exit` continues the boot. Wait for the relabel. It can take a long time and may reboot again. Do not power off. Then log in.

On RHEL 9 and later, `rd.break` on the normal kernel entry can still ask for the root password. If it does, reboot, select the GRUB entry whose name contains `rescue`, press `e`, add `rd.break` the same way, and boot it. Press Enter if it says to press Enter for maintenance, then run the four commands above. If that also asks for the password, GRUB is not a way in. Use Method A or Method B.

A kernel flag that turns SELinux off does not replace `touch /.autorelabel`. Create the relabel file or the new password can be rejected on the next normal boot.

### init=/bin/bash (no rd.break, or a non-RHEL system)

### 1. Edit the same linux line

Press `e` on the normal GRUB entry. On the `linux` line, if `ro` appears as its own word, change it to `rw`. At the end of the line add a space and:

`init=/bin/bash`

Leave `root=` in place.

### 2. Boot and make the disk writable

Press Ctrl+x or F10. You get a root shell. The disk is often still read-only. Run:

`mount -o remount,rw /`

If that prints a read-only error, you are not on the installed root. Stop and use an OS disk.

### 3. Set the password and continue

`passwd root`

On a SELinux system (RHEL, CentOS, Rocky, Alma, Fedora, or `getenforce` not Disabled):

`touch /.autorelabel`

Then continue the boot:

`exec /sbin/init`

If `exec /sbin/init` does not start the system, flush the disk and force a reboot. Plain `reboot` often fails in this shell because systemd is not running:

`sync`

`reboot -f`

### Single user is not a forgotten-password method

Adding `single`, `s`, `1`, or `systemd.unit=rescue.target` is a single user (rescue) boot. On current systemd systems that path still runs sulogin and asks for the root password. Use `rd.break` or `init=/bin/bash` instead. If those are blocked by a GRUB password, use an OS disk.

---

## Troubleshooting

### Encrypted disk (LUKS)

`lsblk -f` or `blkid` shows `crypto_LUKS`, or a partition of type crypt. The login password is inside that encrypted volume. Opening it requires the existing disk passphrase (or a key the site already has). That passphrase is not the root password, and this guide cannot recover it.

Stop and escalate. Do not wipe the disk, do not format it, and do not try to bypass the encryption. A wipe destroys the host OS and the scanner configuration on that computer.

### Read-only filesystem

`passwd` says the filesystem is read-only, or it prints `authentication token manipulation error` right away. Remount read-write, then run `passwd` again:

`mount -o remount,rw /`

In the `rd.break` shell, before chroot, the command is `mount -o remount,rw /sysroot`. Inside the chroot it is `mount -o remount,rw /`.

### Wrong partition

`ls /mnt/sysroot/etc/shadow` fails, or the directory is a boot directory. You mounted `/boot`, the EFI partition, or a data disk. Unmount it and mount the partition that contains `/etc/shadow`.

### authentication token manipulation error

After a read-only mount, the usual remaining causes are:

- You are not in the chroot, so `passwd` is hitting the live image or a read-only tree.
- `/etc/shadow` or `/etc/passwd` is immutable. `lsattr /etc/shadow` shows an `i` flag. On the installed system only: `chattr -i /etc/shadow` and `chattr -i /etc/passwd`, then `passwd root` again.
- The disk is full. `df -h /` shows the root filesystem at 100 percent.
- The chroot is incomplete (no `/etc/pam.d`). Go back and mount the real root, then bind-mount `/dev`, `/proc`, and `/sys`.

### passwd cannot open a terminal

Bind-mount `/dev` again. If it still fails, inside the chroot run `mount -t devpts devpts /dev/pts`, then `passwd root`.

### Keyboard layout

The live desktop layout and the installed console layout are often different. A password set on a UK or other layout will not match a US console later. Before `passwd`, set the layout you will use on the host keyboard (the live desktop keyboard menu, or `loadkeys` on a text console). Prefer characters that are the same on both layouts if you cannot change the map. Test the login on the host's own keyboard before you leave.

### UEFI Secure Boot blocks the OS disk

Firmware may refuse an unsigned USB, or the USB may be missing from the boot menu, with a Secure Boot message. Use a live image that is signed for Secure Boot (current Ubuntu live media and official RHEL-family install media usually are), or use the system's own install disk.

If site policy allows a firmware change, you can turn Secure Boot off for this boot, do the reset, then turn it back on if the site requires it. Write the change on the service report. Confirm the installed OS still boots after you turn it back on.

### GRUB is password-protected

You cannot press `e`. Method C stops here. Boot an OS disk and use Method A or Method B.

### The relabel looks stuck

A SELinux relabel can sit for a long time with little output. Leave it. Powering off in the middle can leave the system unable to log in. If it already rebooted once, let the second boot finish, then try the password.

### Login still fails

The usual causes are the keyboard layout, a password that was set on the live image instead of the installed system, or a skipped `/.autorelabel` on a SELinux host. Boot the OS disk again and repeat Method A. Do not keep guessing if the site locks accounts after failed logins.

---

## After the reset

- Log in at the console and confirm the new password works.
- Remove the USB or DVD.
- Restore the firmware boot order so the next power-on boots the installed disk, not the USB.
- On the service report, record that the root password was reset, the method (OS disk, rescue mode, or GRUB), and the time.
- Record the new credential only where customer policy says to put it. Never store it in this app.
- Delete any copy of `/etc/shadow`, `/etc/passwd`, or `/etc/group` from the USB and from any laptop before you leave.
- Tell the site contact that the password changed and who holds the new one.
- If the host is OEM-managed, note whether you followed the OEM procedure.

---

Manuals path: All_Systems/Field_Guides/Linux-root-password-reset.md
