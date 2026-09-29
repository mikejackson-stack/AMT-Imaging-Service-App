# Publish Firestore rules and email-link sign-in

The app on GitHub Pages does not publish Firebase rules. Nothing in this repo deploys them. Mike pastes the rules in the Firebase console and turns on email-link sign-in there.

Do this once, and again any time `firestore.rules` changes.

## 1. Open the project

Go to [console.firebase.google.com](https://console.firebase.google.com) and open project **amt-imaging-service-app**.

## 2. Paste and publish the Firestore rules

1. Open **Firestore Database**, then **Rules**.
2. Select the rules already in the editor and copy them into a text file on your computer. That copy is the rollback.
3. Open `firestore.rules` from this repo, select all of it, and paste it over the rules in the editor.
4. Click **Publish**.

The published rules deny everyone by default. A read requires a signed-in, email-verified user on the writer or reader list. A write requires a writer. PIN hashes live in `pinHashes` and only writers can read or write that collection.

## 3. Turn on email-link sign-in

1. Open **Authentication**, then **Sign-in method**.
2. Open **Email/Password**.
3. Turn **Enable** on, and turn **Email link (passwordless sign-in)** on.
4. Save.

Leave **Google** turned on. Leave **Anonymous** off. The app does not ask anyone to choose a password. `misemilyoliveros@icloud.com` signs in with the email link because that address is not a Google account.

## 4. Check the authorized domain

1. Still under **Authentication**, open **Settings**, then **Authorized domains**.
2. Confirm **mikejackson-stack.github.io** is on the list. Add it if it is missing.
3. Save.

The sign-in link returns to the hosted app on that domain. `localhost` can stay on the list for local testing.

## 5. Test with a writer, then keep the rollback handy

Before you close the console, sign in to the hosted app as **mike.jackson@amtimagingsolutions.com** (or another writer). Confirm jobs load, a small save reaches Firestore, and **Change PIN** is on the screen. Then sign out and confirm a Google account that is not on the list sees **Not authorized** and is signed out.

If the new rules lock writers out, open **Firestore Database**, then **Rules**, and publish the copy you saved in step 2. The Rules page also keeps earlier published versions. Open that history and publish the previous version if you did not keep a copy.

Do not close the console until a writer account can read and write.
