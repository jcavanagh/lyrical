#!/bin/sh

# Paths!
LYRICAL_DIR="lyrical"
PUBLIC_DIR="${LYRICAL_DIR}/public"
JS_DIR="${PUBLIC_DIR}/js"

MIN_JS="lyrical.min.js"

R_JS="../r.js"
R_JS_CONFIG="require-init.js"

# Build!
cd ${JS_DIR}
node ${R_JS} -o name=lyrical baseUrl=. mainConfigFile=require-init.js out=${MIN_JS}