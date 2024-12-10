<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\CoreExtension;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;
use Twig\TemplateWrapper;

/* @Security/Collector/security.html.twig */
class __TwigTemplate_7a88e1c30153174b99001621e1632391 extends Template
{
    private Source $source;
    /**
     * @var array<string, Template>
     */
    private array $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'page_title' => [$this, 'block_page_title'],
            'head' => [$this, 'block_head'],
            'toolbar' => [$this, 'block_toolbar'],
            'menu' => [$this, 'block_menu'],
            'panel' => [$this, 'block_panel'],
        ];
    }

    protected function doGetParent(array $context): bool|string|Template|TemplateWrapper
    {
        // line 1
        return "@WebProfiler/Profiler/layout.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@Security/Collector/security.html.twig"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@Security/Collector/security.html.twig"));

        $this->parent = $this->loadTemplate("@WebProfiler/Profiler/layout.html.twig", "@Security/Collector/security.html.twig", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

    }

    // line 3
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_page_title(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "page_title"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "page_title"));

        yield "Security";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 5
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_head(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "head"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "head"));

        // line 6
        yield "    ";
        yield from $this->yieldParentBlock("head", $context, $blocks);
        yield "

    <style>
        #collector-content .decision-log .voter_result td {
            border-top-width: 1px;
            border-bottom-width: 0;
            padding-bottom: 0;
        }

        #collector-content .decision-log .voter_details td {
            border-top-width: 0;
            border-bottom-width: 1px;
            padding-bottom: 0;
        }

        #collector-content .decision-log .voter_details table {
            border: 0;
            margin: 0;
            box-shadow: unset;
        }

        #collector-content .decision-log .voter_details table td {
            border: 0;
            padding: 0 0 8px 0;
        }
    </style>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 34
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_toolbar(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "toolbar"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "toolbar"));

        // line 35
        yield "    ";
        if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 35, $this->source); })()), "firewall", [], "any", false, false, false, 35)) {
            // line 36
            yield "        ";
            $context["icon"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                // line 37
                yield "            ";
                yield Twig\Extension\CoreExtension::source($this->env, "@Security/Collector/icon.svg");
                yield "
            <span class=\"sf-toolbar-value\">";
                // line 38
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "user", [], "any", true, true, false, 38)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "user", [], "any", false, false, false, 38), "n/a")) : ("n/a")), "html", null, true);
                yield "</span>
        ";
                yield from [];
            })())) ? '' : new Markup($tmp, $this->env->getCharset());
            // line 40
            yield "
        ";
            // line 41
            $context["text"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                // line 42
                yield "            ";
                if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 42, $this->source); })()), "impersonated", [], "any", false, false, false, 42)) {
                    // line 43
                    yield "                <div class=\"sf-toolbar-info-group\">
                    <div class=\"sf-toolbar-info-piece\">
                        <b>Impersonator</b>
                        <span>";
                    // line 46
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 46, $this->source); })()), "impersonatorUser", [], "any", false, false, false, 46), "html", null, true);
                    yield "</span>
                    </div>
                </div>
            ";
                }
                // line 50
                yield "
            <div class=\"sf-toolbar-info-group\">
                ";
                // line 52
                if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 52, $this->source); })()), "enabled", [], "any", false, false, false, 52)) {
                    // line 53
                    yield "                    ";
                    if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 53, $this->source); })()), "token", [], "any", false, false, false, 53)) {
                        // line 54
                        yield "                        <div class=\"sf-toolbar-info-piece\">
                            <b>Logged in as</b>
                            <span>";
                        // line 56
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 56, $this->source); })()), "user", [], "any", false, false, false, 56), "html", null, true);
                        yield "</span>
                        </div>

                        <div class=\"sf-toolbar-info-piece\">
                            <b>Authenticated</b>
                            <span class=\"sf-toolbar-status sf-toolbar-status-";
                        // line 61
                        yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 61, $this->source); })()), "authenticated", [], "any", false, false, false, 61)) ? ("green") : ("yellow"));
                        yield "\">";
                        yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 61, $this->source); })()), "authenticated", [], "any", false, false, false, 61)) ? ("Yes") : ("No"));
                        yield "</span>
                        </div>

                        <div class=\"sf-toolbar-info-piece\">
                            <b>Roles</b>
                            <span>
                                ";
                        // line 67
                        $context["remainingRoles"] = Twig\Extension\CoreExtension::slice($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 67, $this->source); })()), "roles", [], "any", false, false, false, 67), 1);
                        // line 68
                        yield "                                ";
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::first($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 68, $this->source); })()), "roles", [], "any", false, false, false, 68)), "html", null, true);
                        yield "
                                ";
                        // line 69
                        if ( !Twig\Extension\CoreExtension::testEmpty((isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 69, $this->source); })()))) {
                            // line 70
                            yield "                                    +
                                    <abbr title=\"";
                            // line 71
                            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::join((isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 71, $this->source); })()), ", "), "html", null, true);
                            yield "\">
                                        ";
                            // line 72
                            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::length($this->env->getCharset(), (isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 72, $this->source); })())), "html", null, true);
                            yield " more
                                    </abbr>
                                ";
                        }
                        // line 75
                        yield "                            </span>
                        </div>

                        ";
                        // line 78
                        if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 78, $this->source); })()), "supportsRoleHierarchy", [], "any", false, false, false, 78)) {
                            // line 79
                            yield "                            <div class=\"sf-toolbar-info-piece\">
                                <b>Inherited Roles</b>
                                <span>
                                    ";
                            // line 82
                            if (Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 82, $this->source); })()), "inheritedRoles", [], "any", false, false, false, 82))) {
                                // line 83
                                yield "                                        none
                                    ";
                            } else {
                                // line 85
                                yield "                                        ";
                                $context["remainingRoles"] = Twig\Extension\CoreExtension::slice($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 85, $this->source); })()), "inheritedRoles", [], "any", false, false, false, 85), 1);
                                // line 86
                                yield "                                        ";
                                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::first($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 86, $this->source); })()), "inheritedRoles", [], "any", false, false, false, 86)), "html", null, true);
                                yield "
                                        ";
                                // line 87
                                if ( !Twig\Extension\CoreExtension::testEmpty((isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 87, $this->source); })()))) {
                                    // line 88
                                    yield "                                            +
                                            <abbr title=\"";
                                    // line 89
                                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::join((isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 89, $this->source); })()), ", "), "html", null, true);
                                    yield "\">
                                                ";
                                    // line 90
                                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::length($this->env->getCharset(), (isset($context["remainingRoles"]) || array_key_exists("remainingRoles", $context) ? $context["remainingRoles"] : (function () { throw new RuntimeError('Variable "remainingRoles" does not exist.', 90, $this->source); })())), "html", null, true);
                                    yield " more
                                            </abbr>
                                        ";
                                }
                                // line 93
                                yield "                                    ";
                            }
                            // line 94
                            yield "                                </span>
                            </div>
                        ";
                        }
                        // line 97
                        yield "
                        <div class=\"sf-toolbar-info-piece\">
                            <b>Token class</b>
                            <span>";
                        // line 100
                        yield $this->extensions['Symfony\Bridge\Twig\Extension\CodeExtension']->abbrClass($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 100, $this->source); })()), "tokenClass", [], "any", false, false, false, 100), "html", null, true));
                        yield "</span>
                        </div>
                    ";
                    } else {
                        // line 103
                        yield "                        <div class=\"sf-toolbar-info-piece\">
                            <b>Authenticated</b>
                            <span class=\"sf-toolbar-status sf-toolbar-status-yellow\">No</span>
                        </div>
                    ";
                    }
                    // line 108
                    yield "
                    ";
                    // line 109
                    if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 109, $this->source); })()), "firewall", [], "any", false, false, false, 109)) {
                        // line 110
                        yield "                        <div class=\"sf-toolbar-info-piece\">
                            <b>Firewall name</b>
                            <span>";
                        // line 112
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 112, $this->source); })()), "firewall", [], "any", false, false, false, 112), "name", [], "any", false, false, false, 112), "html", null, true);
                        yield "</span>
                        </div>
                    ";
                    }
                    // line 115
                    yield "
                    ";
                    // line 116
                    if ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 116, $this->source); })()), "token", [], "any", false, false, false, 116) && CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 116, $this->source); })()), "logoutUrl", [], "any", false, false, false, 116))) {
                        // line 117
                        yield "                        <div class=\"sf-toolbar-info-piece\">
                            <b>Actions</b>
                            <span>
                                <a href=\"";
                        // line 120
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 120, $this->source); })()), "logoutUrl", [], "any", false, false, false, 120), "html", null, true);
                        yield "\">Logout</a>
                                ";
                        // line 121
                        if ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 121, $this->source); })()), "impersonated", [], "any", false, false, false, 121) && CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 121, $this->source); })()), "impersonationExitPath", [], "any", false, false, false, 121))) {
                            // line 122
                            yield "                                    | <a href=\"";
                            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 122, $this->source); })()), "impersonationExitPath", [], "any", false, false, false, 122), "html", null, true);
                            yield "\">Exit impersonation</a>
                                ";
                        }
                        // line 124
                        yield "                            </span>
                        </div>
                    ";
                    }
                    // line 127
                    yield "                ";
                } else {
                    // line 128
                    yield "                    <div class=\"sf-toolbar-info-piece\">
                        <span>The security is disabled.</span>
                    </div>
                ";
                }
                // line 132
                yield "            </div>
        ";
                yield from [];
            })())) ? '' : new Markup($tmp, $this->env->getCharset());
            // line 134
            yield "
        ";
            // line 135
            yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/toolbar_item.html.twig", ["link" => (isset($context["profiler_url"]) || array_key_exists("profiler_url", $context) ? $context["profiler_url"] : (function () { throw new RuntimeError('Variable "profiler_url" does not exist.', 135, $this->source); })())]);
            yield "
    ";
        }
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 139
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_menu(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "menu"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "menu"));

        // line 140
        yield "    <span class=\"label ";
        yield ((( !CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 140, $this->source); })()), "firewall", [], "any", false, false, false, 140) ||  !CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 140, $this->source); })()), "token", [], "any", false, false, false, 140))) ? ("disabled") : (""));
        yield "\">
        <span class=\"icon\">";
        // line 141
        yield Twig\Extension\CoreExtension::source($this->env, "@Security/Collector/icon.svg");
        yield "</span>
        <strong>Security</strong>
    </span>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 146
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_panel(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "panel"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "panel"));

        // line 147
        yield "    <h2>Security</h2>
    ";
        // line 148
        if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 148, $this->source); })()), "enabled", [], "any", false, false, false, 148)) {
            // line 149
            yield "        <div class=\"sf-tabs\">
            <div class=\"tab ";
            // line 150
            yield ((Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 150, $this->source); })()), "token", [], "any", false, false, false, 150))) ? ("disabled") : (""));
            yield "\">
                <h3 class=\"tab-title\">Token</h3>

                <div class=\"tab-content\">
                    ";
            // line 154
            if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 154, $this->source); })()), "token", [], "any", false, false, false, 154)) {
                // line 155
                yield "                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 157
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 157, $this->source); })()), "user", [], "any", false, false, false, 157), "html", null, true);
                yield "</span>
                                <span class=\"label\">Username</span>
                            </div>

                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 162
                yield Twig\Extension\CoreExtension::source($this->env, (("@WebProfiler/Icon/" . ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 162, $this->source); })()), "authenticated", [], "any", false, false, false, 162)) ? ("yes") : ("no"))) . ".svg"));
                yield "</span>
                                <span class=\"label\">Authenticated</span>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th scope=\"col\" class=\"key\">Property</th>
                                    <th scope=\"col\">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Roles</th>
                                    <td>
                                        ";
                // line 178
                yield ((Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 178, $this->source); })()), "roles", [], "any", false, false, false, 178))) ? ("none") : ($this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 178, $this->source); })()), "roles", [], "any", false, false, false, 178), 1)));
                yield "

                                        ";
                // line 180
                if (( !CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 180, $this->source); })()), "authenticated", [], "any", false, false, false, 180) && Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 180, $this->source); })()), "roles", [], "any", false, false, false, 180)))) {
                    // line 181
                    yield "                                            <p class=\"help\">User is not authenticated probably because they have no roles.</p>
                                        ";
                }
                // line 183
                yield "                                    </td>
                                </tr>

                                ";
                // line 186
                if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 186, $this->source); })()), "supportsRoleHierarchy", [], "any", false, false, false, 186)) {
                    // line 187
                    yield "                                <tr>
                                    <th>Inherited Roles</th>
                                    <td>";
                    // line 189
                    yield ((Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 189, $this->source); })()), "inheritedRoles", [], "any", false, false, false, 189))) ? ("none") : ($this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 189, $this->source); })()), "inheritedRoles", [], "any", false, false, false, 189), 1)));
                    yield "</td>
                                </tr>
                                ";
                }
                // line 192
                yield "
                                ";
                // line 193
                if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 193, $this->source); })()), "token", [], "any", false, false, false, 193)) {
                    // line 194
                    yield "                                <tr>
                                    <th>Token</th>
                                    <td>";
                    // line 196
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 196, $this->source); })()), "token", [], "any", false, false, false, 196));
                    yield "</td>
                                </tr>
                                ";
                }
                // line 199
                yield "                            </tbody>
                        </table>
                    ";
            } elseif (CoreExtension::getAttribute($this->env, $this->source,             // line 201
(isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 201, $this->source); })()), "enabled", [], "any", false, false, false, 201)) {
                // line 202
                yield "                        <div class=\"empty\">
                            <p>There is no security token.</p>
                        </div>
                    ";
            }
            // line 206
            yield "                </div>
            </div>

            <div class=\"tab ";
            // line 209
            yield ((( !CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 209, $this->source); })()), "firewall", [], "any", false, false, false, 209) || Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 209, $this->source); })()), "firewall", [], "any", false, false, false, 209), "security_enabled", [], "any", false, false, false, 209)))) ? ("disabled") : (""));
            yield "\">
                <h3 class=\"tab-title\">Firewall</h3>
                <div class=\"tab-content\">
                    ";
            // line 212
            if (CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 212, $this->source); })()), "firewall", [], "any", false, false, false, 212)) {
                // line 213
                yield "                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 215
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 215, $this->source); })()), "firewall", [], "any", false, false, false, 215), "name", [], "any", false, false, false, 215), "html", null, true);
                yield "</span>
                                <span class=\"label\">Name</span>
                            </div>
                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 219
                yield Twig\Extension\CoreExtension::source($this->env, (("@WebProfiler/Icon/" . ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 219, $this->source); })()), "firewall", [], "any", false, false, false, 219), "security_enabled", [], "any", false, false, false, 219)) ? ("yes") : ("no"))) . ".svg"));
                yield "</span>
                                <span class=\"label\">Security enabled</span>
                            </div>
                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 223
                yield Twig\Extension\CoreExtension::source($this->env, (("@WebProfiler/Icon/" . ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 223, $this->source); })()), "firewall", [], "any", false, false, false, 223), "stateless", [], "any", false, false, false, 223)) ? ("yes") : ("no"))) . ".svg"));
                yield "</span>
                                <span class=\"label\">Stateless</span>
                            </div>
                        </div>

                        ";
                // line 228
                if (CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 228, $this->source); })()), "firewall", [], "any", false, false, false, 228), "security_enabled", [], "any", false, false, false, 228)) {
                    // line 229
                    yield "                            <h4>Configuration</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th scope=\"col\" class=\"key\">Key</th>
                                        <th scope=\"col\">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>provider</th>
                                        <td>";
                    // line 240
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 240, $this->source); })()), "firewall", [], "any", false, false, false, 240), "provider", [], "any", false, false, false, 240)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 240, $this->source); })()), "firewall", [], "any", false, false, false, 240), "provider", [], "any", false, false, false, 240), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>context</th>
                                        <td>";
                    // line 244
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 244, $this->source); })()), "firewall", [], "any", false, false, false, 244), "context", [], "any", false, false, false, 244)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 244, $this->source); })()), "firewall", [], "any", false, false, false, 244), "context", [], "any", false, false, false, 244), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>entry_point</th>
                                        <td>";
                    // line 248
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 248, $this->source); })()), "firewall", [], "any", false, false, false, 248), "entry_point", [], "any", false, false, false, 248)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 248, $this->source); })()), "firewall", [], "any", false, false, false, 248), "entry_point", [], "any", false, false, false, 248), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>user_checker</th>
                                        <td>";
                    // line 252
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 252, $this->source); })()), "firewall", [], "any", false, false, false, 252), "user_checker", [], "any", false, false, false, 252)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 252, $this->source); })()), "firewall", [], "any", false, false, false, 252), "user_checker", [], "any", false, false, false, 252), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>access_denied_handler</th>
                                        <td>";
                    // line 256
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 256, $this->source); })()), "firewall", [], "any", false, false, false, 256), "access_denied_handler", [], "any", false, false, false, 256)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 256, $this->source); })()), "firewall", [], "any", false, false, false, 256), "access_denied_handler", [], "any", false, false, false, 256), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>access_denied_url</th>
                                        <td>";
                    // line 260
                    yield ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 260, $this->source); })()), "firewall", [], "any", false, false, false, 260), "access_denied_url", [], "any", false, false, false, 260)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 260, $this->source); })()), "firewall", [], "any", false, false, false, 260), "access_denied_url", [], "any", false, false, false, 260), "html", null, true)) : ("(none)"));
                    yield "</td>
                                    </tr>
                                    <tr>
                                        <th>authenticators</th>
                                        <td>";
                    // line 264
                    yield ((Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 264, $this->source); })()), "firewall", [], "any", false, false, false, 264), "authenticators", [], "any", false, false, false, 264))) ? ("(none)") : ($this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 264, $this->source); })()), "firewall", [], "any", false, false, false, 264), "authenticators", [], "any", false, false, false, 264), 1)));
                    yield "</td>
                                    </tr>
                                </tbody>
                            </table>
                        ";
                }
                // line 269
                yield "                    ";
            }
            // line 270
            yield "                </div>
            </div>

            <div class=\"tab ";
            // line 273
            yield ((Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "listeners", [], "any", true, true, false, 273)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "listeners", [], "any", false, false, false, 273), [])) : ([])))) ? ("disabled") : (""));
            yield "\">
                <h3 class=\"tab-title\">Listeners</h3>
                <div class=\"tab-content\">
                    ";
            // line 276
            if (Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "listeners", [], "any", true, true, false, 276)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "listeners", [], "any", false, false, false, 276), [])) : ([])))) {
                // line 277
                yield "                        <div class=\"empty\">
                            <p>No security listeners have been recorded. Check that debugging is enabled in the kernel.</p>
                        </div>
                    ";
            } else {
                // line 281
                yield "                        <table>
                            <thead>
                            <tr>
                                <th>Listener</th>
                                <th>Duration</th>
                                <th>Response</th>
                            </tr>
                            </thead>

                            ";
                // line 290
                $context["previous_event"] = Twig\Extension\CoreExtension::first($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 290, $this->source); })()), "listeners", [], "any", false, false, false, 290));
                // line 291
                yield "                            ";
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 291, $this->source); })()), "listeners", [], "any", false, false, false, 291));
                $context['loop'] = [
                  'parent' => $context['_parent'],
                  'index0' => 0,
                  'index'  => 1,
                  'first'  => true,
                ];
                if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                    $length = count($context['_seq']);
                    $context['loop']['revindex0'] = $length - 1;
                    $context['loop']['revindex'] = $length;
                    $context['loop']['length'] = $length;
                    $context['loop']['last'] = 1 === $length;
                }
                foreach ($context['_seq'] as $context["_key"] => $context["listener"]) {
                    // line 292
                    yield "                                ";
                    if ((CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 292) || ($context["listener"] != (isset($context["previous_event"]) || array_key_exists("previous_event", $context) ? $context["previous_event"] : (function () { throw new RuntimeError('Variable "previous_event" does not exist.', 292, $this->source); })())))) {
                        // line 293
                        yield "                                    ";
                        if ( !CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 293)) {
                            // line 294
                            yield "                                        </tbody>
                                    ";
                        }
                        // line 296
                        yield "                                    <tbody>
                                    ";
                        // line 297
                        $context["previous_event"] = $context["listener"];
                        // line 298
                        yield "                                ";
                    }
                    // line 299
                    yield "
                                <tr>
                                    <td class=\"font-normal\">";
                    // line 301
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["listener"], "stub", [], "any", false, false, false, 301));
                    yield "</td>
                                    <td class=\"no-wrap\">";
                    // line 302
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::sprintf("%0.2f", (CoreExtension::getAttribute($this->env, $this->source, $context["listener"], "time", [], "any", false, false, false, 302) * 1000)), "html", null, true);
                    yield " ms</td>
                                    <td class=\"font-normal\">";
                    // line 303
                    yield ((CoreExtension::getAttribute($this->env, $this->source, $context["listener"], "response", [], "any", false, false, false, 303)) ? ($this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["listener"], "response", [], "any", false, false, false, 303))) : ("(none)"));
                    yield "</td>
                                </tr>

                                ";
                    // line 306
                    if (CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "last", [], "any", false, false, false, 306)) {
                        // line 307
                        yield "                                    </tbody>
                                ";
                    }
                    // line 309
                    yield "                            ";
                    ++$context['loop']['index0'];
                    ++$context['loop']['index'];
                    $context['loop']['first'] = false;
                    if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                        --$context['loop']['revindex0'];
                        --$context['loop']['revindex'];
                        $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                    }
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_key'], $context['listener'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 310
                yield "                        </table>
                    ";
            }
            // line 312
            yield "                </div>
            </div>

            <div class=\"tab ";
            // line 315
            yield ((Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "authenticators", [], "any", true, true, false, 315)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "authenticators", [], "any", false, false, false, 315), [])) : ([])))) ? ("disabled") : (""));
            yield "\">
                <h3 class=\"tab-title\">Authenticators</h3>
                <div class=\"tab-content\">
                    ";
            // line 318
            if ( !Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "authenticators", [], "any", true, true, false, 318)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "authenticators", [], "any", false, false, false, 318), [])) : ([])))) {
                // line 319
                yield "                        <table>
                            <thead>
                            <tr>
                                <th>Authenticator</th>
                                <th>Supports</th>
                                <th>Duration</th>
                                <th>Passport</th>
                            </tr>
                            </thead>

                            ";
                // line 329
                $context["previous_event"] = Twig\Extension\CoreExtension::first($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 329, $this->source); })()), "listeners", [], "any", false, false, false, 329));
                // line 330
                yield "                            ";
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 330, $this->source); })()), "authenticators", [], "any", false, false, false, 330));
                $context['loop'] = [
                  'parent' => $context['_parent'],
                  'index0' => 0,
                  'index'  => 1,
                  'first'  => true,
                ];
                if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                    $length = count($context['_seq']);
                    $context['loop']['revindex0'] = $length - 1;
                    $context['loop']['revindex'] = $length;
                    $context['loop']['length'] = $length;
                    $context['loop']['last'] = 1 === $length;
                }
                foreach ($context['_seq'] as $context["_key"] => $context["authenticator"]) {
                    // line 331
                    yield "                                ";
                    if ((CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 331) || ($context["authenticator"] != (isset($context["previous_event"]) || array_key_exists("previous_event", $context) ? $context["previous_event"] : (function () { throw new RuntimeError('Variable "previous_event" does not exist.', 331, $this->source); })())))) {
                        // line 332
                        yield "                                    ";
                        if ( !CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "first", [], "any", false, false, false, 332)) {
                            // line 333
                            yield "                                        </tbody>
                                    ";
                        }
                        // line 335
                        yield "
                                    <tbody>
                                    ";
                        // line 337
                        $context["previous_event"] = $context["authenticator"];
                        // line 338
                        yield "                                ";
                    }
                    // line 339
                    yield "
                                <tr>
                                    <td class=\"font-normal\">";
                    // line 341
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["authenticator"], "stub", [], "any", false, false, false, 341));
                    yield "</td>
                                    <td class=\"no-wrap\">";
                    // line 342
                    yield Twig\Extension\CoreExtension::source($this->env, (("@WebProfiler/Icon/" . ((CoreExtension::getAttribute($this->env, $this->source, $context["authenticator"], "supports", [], "any", false, false, false, 342)) ? ("yes") : ("no"))) . ".svg"));
                    yield "</td>
                                    <td class=\"no-wrap\">";
                    // line 343
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::sprintf("%0.2f", (CoreExtension::getAttribute($this->env, $this->source, $context["authenticator"], "duration", [], "any", false, false, false, 343) * 1000)), "html", null, true);
                    yield " ms</td>
                                    <td class=\"font-normal\">";
                    // line 344
                    yield ((CoreExtension::getAttribute($this->env, $this->source, $context["authenticator"], "passport", [], "any", false, false, false, 344)) ? ($this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["authenticator"], "passport", [], "any", false, false, false, 344))) : ("(none)"));
                    yield "</td>
                                </tr>

                                ";
                    // line 347
                    if (CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "last", [], "any", false, false, false, 347)) {
                        // line 348
                        yield "                                    </tbody>
                                ";
                    }
                    // line 350
                    yield "                            ";
                    ++$context['loop']['index0'];
                    ++$context['loop']['index'];
                    $context['loop']['first'] = false;
                    if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                        --$context['loop']['revindex0'];
                        --$context['loop']['revindex'];
                        $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                    }
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_key'], $context['authenticator'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 351
                yield "                        </table>
                    ";
            } else {
                // line 353
                yield "                        <div class=\"empty\">
                            <p>No authenticators have been recorded. Check previous profiles on your authentication endpoint.</p>
                        </div>
                    ";
            }
            // line 357
            yield "                </div>
            </div>

            <div class=\"tab ";
            // line 360
            yield ((Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "accessDecisionLog", [], "any", true, true, false, 360)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "accessDecisionLog", [], "any", false, false, false, 360), [])) : ([])))) ? ("disabled") : (""));
            yield "\">
                <h3 class=\"tab-title\">Access Decision</h3>
                <div class=\"tab-content\">
                    ";
            // line 363
            if ( !Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "voters", [], "any", true, true, false, 363)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "voters", [], "any", false, false, false, 363), [])) : ([])))) {
                // line 364
                yield "                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">";
                // line 366
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "voterStrategy", [], "any", true, true, false, 366)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "voterStrategy", [], "any", false, false, false, 366), "unknown")) : ("unknown")), "html", null, true);
                yield "</span>
                                <span class=\"label\">Strategy</span>
                            </div>
                        </div>

                        <table class=\"voters\">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Voter class</th>
                                </tr>
                            </thead>

                            <tbody>
                                ";
                // line 380
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 380, $this->source); })()), "voters", [], "any", false, false, false, 380));
                $context['loop'] = [
                  'parent' => $context['_parent'],
                  'index0' => 0,
                  'index'  => 1,
                  'first'  => true,
                ];
                if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                    $length = count($context['_seq']);
                    $context['loop']['revindex0'] = $length - 1;
                    $context['loop']['revindex'] = $length;
                    $context['loop']['length'] = $length;
                    $context['loop']['last'] = 1 === $length;
                }
                foreach ($context['_seq'] as $context["_key"] => $context["voter"]) {
                    // line 381
                    yield "                                    <tr>
                                        <td class=\"font-normal text-small text-muted nowrap\">";
                    // line 382
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "index", [], "any", false, false, false, 382), "html", null, true);
                    yield "</td>
                                        <td class=\"font-normal\">";
                    // line 383
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, $context["voter"]);
                    yield "</td>
                                    </tr>
                                ";
                    ++$context['loop']['index0'];
                    ++$context['loop']['index'];
                    $context['loop']['first'] = false;
                    if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                        --$context['loop']['revindex0'];
                        --$context['loop']['revindex'];
                        $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                    }
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_key'], $context['voter'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 386
                yield "                            </tbody>
                        </table>
                    ";
            }
            // line 389
            yield "                    ";
            if ( !Twig\Extension\CoreExtension::testEmpty(((CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "accessDecisionLog", [], "any", true, true, false, 389)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["collector"] ?? null), "accessDecisionLog", [], "any", false, false, false, 389), [])) : ([])))) {
                // line 390
                yield "                        <h2>Access decision log</h2>

                        <table class=\"decision-log\">
                            <col style=\"width: 30px\">
                            <col style=\"width: 120px\">
                            <col style=\"width: 25%\">
                            <col style=\"width: 60%\">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Result</th>
                                    <th>Attributes</th>
                                    <th>Object</th>
                                </tr>
                            </thead>

                            <tbody>
                                ";
                // line 408
                $context['_parent'] = $context;
                $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 408, $this->source); })()), "accessDecisionLog", [], "any", false, false, false, 408));
                $context['loop'] = [
                  'parent' => $context['_parent'],
                  'index0' => 0,
                  'index'  => 1,
                  'first'  => true,
                ];
                if (is_array($context['_seq']) || (is_object($context['_seq']) && $context['_seq'] instanceof \Countable)) {
                    $length = count($context['_seq']);
                    $context['loop']['revindex0'] = $length - 1;
                    $context['loop']['revindex'] = $length;
                    $context['loop']['length'] = $length;
                    $context['loop']['last'] = 1 === $length;
                }
                foreach ($context['_seq'] as $context["_key"] => $context["decision"]) {
                    // line 409
                    yield "                                    <tr class=\"voter_result\">
                                        <td class=\"font-normal text-small text-muted nowrap\">";
                    // line 410
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "index", [], "any", false, false, false, 410), "html", null, true);
                    yield "</td>
                                        <td class=\"font-normal\">
                                            ";
                    // line 412
                    yield ((CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "result", [], "any", false, false, false, 412)) ? ("<span class=\"label status-success same-width\">GRANTED</span>") : ("<span class=\"label status-error same-width\">DENIED</span>"));
                    // line 415
                    yield "
                                        </td>
                                        <td>
                                            ";
                    // line 418
                    if ((Twig\Extension\CoreExtension::length($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "attributes", [], "any", false, false, false, 418)) == 1)) {
                        // line 419
                        yield "                                                ";
                        $context["attribute"] = Twig\Extension\CoreExtension::first($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "attributes", [], "any", false, false, false, 419));
                        // line 420
                        yield "                                                ";
                        if (CoreExtension::getAttribute($this->env, $this->source, ($context["attribute"] ?? null), "expression", [], "any", true, true, false, 420)) {
                            // line 421
                            yield "                                                    Expression: <pre><code>";
                            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["attribute"]) || array_key_exists("attribute", $context) ? $context["attribute"] : (function () { throw new RuntimeError('Variable "attribute" does not exist.', 421, $this->source); })()), "expression", [], "any", false, false, false, 421), "html", null, true);
                            yield "</code></pre>
                                                ";
                        } elseif ((CoreExtension::getAttribute($this->env, $this->source,                         // line 422
(isset($context["attribute"]) || array_key_exists("attribute", $context) ? $context["attribute"] : (function () { throw new RuntimeError('Variable "attribute" does not exist.', 422, $this->source); })()), "type", [], "any", false, false, false, 422) == "string")) {
                            // line 423
                            yield "                                                    ";
                            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["attribute"]) || array_key_exists("attribute", $context) ? $context["attribute"] : (function () { throw new RuntimeError('Variable "attribute" does not exist.', 423, $this->source); })()), "html", null, true);
                            yield "
                                                ";
                        } else {
                            // line 425
                            yield "                                                     ";
                            yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, (isset($context["attribute"]) || array_key_exists("attribute", $context) ? $context["attribute"] : (function () { throw new RuntimeError('Variable "attribute" does not exist.', 425, $this->source); })()));
                            yield "
                                                ";
                        }
                        // line 427
                        yield "                                            ";
                    } else {
                        // line 428
                        yield "                                                ";
                        yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "attributes", [], "any", false, false, false, 428));
                        yield "
                                            ";
                    }
                    // line 430
                    yield "                                        </td>
                                        <td>";
                    // line 431
                    yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "seek", ["object"], "method", false, false, false, 431));
                    yield "</td>
                                    </tr>
                                    <tr class=\"voter_details\">
                                        <td></td>
                                        <td colspan=\"3\">
                                        ";
                    // line 436
                    if ( !Twig\Extension\CoreExtension::testEmpty(CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "voter_details", [], "any", false, false, false, 436))) {
                        // line 437
                        yield "                                            ";
                        $context["voter_details_id"] = ("voter-details-" . CoreExtension::getAttribute($this->env, $this->source, $context["loop"], "index", [], "any", false, false, false, 437));
                        // line 438
                        yield "                                            <div id=\"";
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["voter_details_id"]) || array_key_exists("voter_details_id", $context) ? $context["voter_details_id"] : (function () { throw new RuntimeError('Variable "voter_details_id" does not exist.', 438, $this->source); })()), "html", null, true);
                        yield "\" class=\"sf-toggle-content sf-toggle-hidden\">
                                                <table>
                                                   <tbody>
                                                    ";
                        // line 441
                        $context['_parent'] = $context;
                        $context['_seq'] = CoreExtension::ensureTraversable(CoreExtension::getAttribute($this->env, $this->source, $context["decision"], "voter_details", [], "any", false, false, false, 441));
                        foreach ($context['_seq'] as $context["_key"] => $context["voter_detail"]) {
                            // line 442
                            yield "                                                        <tr>
                                                            <td class=\"font-normal\">";
                            // line 443
                            yield $this->extensions['Symfony\Bundle\WebProfilerBundle\Twig\WebProfilerExtension']->dumpData($this->env, CoreExtension::getAttribute($this->env, $this->source, $context["voter_detail"], "class", [], "array", false, false, false, 443));
                            yield "</td>
                                                            ";
                            // line 444
                            if ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["collector"]) || array_key_exists("collector", $context) ? $context["collector"] : (function () { throw new RuntimeError('Variable "collector" does not exist.', 444, $this->source); })()), "voterStrategy", [], "any", false, false, false, 444) == "unanimous")) {
                                // line 445
                                yield "                                                            <td class=\"font-normal text-small\">attribute ";
                                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, $context["voter_detail"], "attributes", [], "array", false, false, false, 445), 0, [], "array", false, false, false, 445), "html", null, true);
                                yield "</td>
                                                            ";
                            }
                            // line 447
                            yield "                                                            <td class=\"font-normal text-small\">
                                                                ";
                            // line 448
                            if ((CoreExtension::getAttribute($this->env, $this->source, $context["voter_detail"], "vote", [], "array", false, false, false, 448) == Twig\Extension\CoreExtension::constant("Symfony\\Component\\Security\\Core\\Authorization\\Voter\\VoterInterface::ACCESS_GRANTED"))) {
                                // line 449
                                yield "                                                                    ACCESS GRANTED
                                                                ";
                            } elseif ((CoreExtension::getAttribute($this->env, $this->source,                             // line 450
$context["voter_detail"], "vote", [], "array", false, false, false, 450) == Twig\Extension\CoreExtension::constant("Symfony\\Component\\Security\\Core\\Authorization\\Voter\\VoterInterface::ACCESS_ABSTAIN"))) {
                                // line 451
                                yield "                                                                    ACCESS ABSTAIN
                                                                ";
                            } elseif ((CoreExtension::getAttribute($this->env, $this->source,                             // line 452
$context["voter_detail"], "vote", [], "array", false, false, false, 452) == Twig\Extension\CoreExtension::constant("Symfony\\Component\\Security\\Core\\Authorization\\Voter\\VoterInterface::ACCESS_DENIED"))) {
                                // line 453
                                yield "                                                                    ACCESS DENIED
                                                                ";
                            } else {
                                // line 455
                                yield "                                                                    unknown (";
                                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["voter_detail"], "vote", [], "array", false, false, false, 455), "html", null, true);
                                yield ")
                                                                ";
                            }
                            // line 457
                            yield "                                                            </td>
                                                        </tr>
                                                    ";
                        }
                        $_parent = $context['_parent'];
                        unset($context['_seq'], $context['_key'], $context['voter_detail'], $context['_parent']);
                        $context = array_intersect_key($context, $_parent) + $_parent;
                        // line 460
                        yield "                                                    </tbody>
                                                </table>
                                            </div>
                                            <a class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#";
                        // line 463
                        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["voter_details_id"]) || array_key_exists("voter_details_id", $context) ? $context["voter_details_id"] : (function () { throw new RuntimeError('Variable "voter_details_id" does not exist.', 463, $this->source); })()), "html", null, true);
                        yield "\" data-toggle-alt-content=\"Hide voter details\">Show voter details</a>
                                        ";
                    }
                    // line 465
                    yield "                                        </td>
                                    </tr>
                                ";
                    ++$context['loop']['index0'];
                    ++$context['loop']['index'];
                    $context['loop']['first'] = false;
                    if (isset($context['loop']['revindex0'], $context['loop']['revindex'])) {
                        --$context['loop']['revindex0'];
                        --$context['loop']['revindex'];
                        $context['loop']['last'] = 0 === $context['loop']['revindex0'];
                    }
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_key'], $context['decision'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 468
                yield "                            </tbody>
                        </table>
                    </div>
                ";
            }
            // line 472
            yield "            </div>
        </div>
    ";
        }
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@Security/Collector/security.html.twig";
    }

    /**
     * @codeCoverageIgnore
     */
    public function isTraitable(): bool
    {
        return false;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo(): array
    {
        return array (  1146 => 472,  1140 => 468,  1124 => 465,  1119 => 463,  1114 => 460,  1106 => 457,  1100 => 455,  1096 => 453,  1094 => 452,  1091 => 451,  1089 => 450,  1086 => 449,  1084 => 448,  1081 => 447,  1075 => 445,  1073 => 444,  1069 => 443,  1066 => 442,  1062 => 441,  1055 => 438,  1052 => 437,  1050 => 436,  1042 => 431,  1039 => 430,  1033 => 428,  1030 => 427,  1024 => 425,  1018 => 423,  1016 => 422,  1011 => 421,  1008 => 420,  1005 => 419,  1003 => 418,  998 => 415,  996 => 412,  991 => 410,  988 => 409,  971 => 408,  951 => 390,  948 => 389,  943 => 386,  926 => 383,  922 => 382,  919 => 381,  902 => 380,  885 => 366,  881 => 364,  879 => 363,  873 => 360,  868 => 357,  862 => 353,  858 => 351,  844 => 350,  840 => 348,  838 => 347,  832 => 344,  828 => 343,  824 => 342,  820 => 341,  816 => 339,  813 => 338,  811 => 337,  807 => 335,  803 => 333,  800 => 332,  797 => 331,  779 => 330,  777 => 329,  765 => 319,  763 => 318,  757 => 315,  752 => 312,  748 => 310,  734 => 309,  730 => 307,  728 => 306,  722 => 303,  718 => 302,  714 => 301,  710 => 299,  707 => 298,  705 => 297,  702 => 296,  698 => 294,  695 => 293,  692 => 292,  674 => 291,  672 => 290,  661 => 281,  655 => 277,  653 => 276,  647 => 273,  642 => 270,  639 => 269,  631 => 264,  624 => 260,  617 => 256,  610 => 252,  603 => 248,  596 => 244,  589 => 240,  576 => 229,  574 => 228,  566 => 223,  559 => 219,  552 => 215,  548 => 213,  546 => 212,  540 => 209,  535 => 206,  529 => 202,  527 => 201,  523 => 199,  517 => 196,  513 => 194,  511 => 193,  508 => 192,  502 => 189,  498 => 187,  496 => 186,  491 => 183,  487 => 181,  485 => 180,  480 => 178,  461 => 162,  453 => 157,  449 => 155,  447 => 154,  440 => 150,  437 => 149,  435 => 148,  432 => 147,  419 => 146,  404 => 141,  399 => 140,  386 => 139,  372 => 135,  369 => 134,  364 => 132,  358 => 128,  355 => 127,  350 => 124,  344 => 122,  342 => 121,  338 => 120,  333 => 117,  331 => 116,  328 => 115,  322 => 112,  318 => 110,  316 => 109,  313 => 108,  306 => 103,  300 => 100,  295 => 97,  290 => 94,  287 => 93,  281 => 90,  277 => 89,  274 => 88,  272 => 87,  267 => 86,  264 => 85,  260 => 83,  258 => 82,  253 => 79,  251 => 78,  246 => 75,  240 => 72,  236 => 71,  233 => 70,  231 => 69,  226 => 68,  224 => 67,  213 => 61,  205 => 56,  201 => 54,  198 => 53,  196 => 52,  192 => 50,  185 => 46,  180 => 43,  177 => 42,  175 => 41,  172 => 40,  166 => 38,  161 => 37,  158 => 36,  155 => 35,  142 => 34,  103 => 6,  90 => 5,  67 => 3,  44 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("{% extends '@WebProfiler/Profiler/layout.html.twig' %}

{% block page_title 'Security' %}

{% block head %}
    {{ parent() }}

    <style>
        #collector-content .decision-log .voter_result td {
            border-top-width: 1px;
            border-bottom-width: 0;
            padding-bottom: 0;
        }

        #collector-content .decision-log .voter_details td {
            border-top-width: 0;
            border-bottom-width: 1px;
            padding-bottom: 0;
        }

        #collector-content .decision-log .voter_details table {
            border: 0;
            margin: 0;
            box-shadow: unset;
        }

        #collector-content .decision-log .voter_details table td {
            border: 0;
            padding: 0 0 8px 0;
        }
    </style>
{% endblock %}

{% block toolbar %}
    {% if collector.firewall %}
        {% set icon %}
            {{ source('@Security/Collector/icon.svg') }}
            <span class=\"sf-toolbar-value\">{{ collector.user|default('n/a') }}</span>
        {% endset %}

        {% set text %}
            {% if collector.impersonated %}
                <div class=\"sf-toolbar-info-group\">
                    <div class=\"sf-toolbar-info-piece\">
                        <b>Impersonator</b>
                        <span>{{ collector.impersonatorUser }}</span>
                    </div>
                </div>
            {% endif %}

            <div class=\"sf-toolbar-info-group\">
                {% if collector.enabled %}
                    {% if collector.token %}
                        <div class=\"sf-toolbar-info-piece\">
                            <b>Logged in as</b>
                            <span>{{ collector.user }}</span>
                        </div>

                        <div class=\"sf-toolbar-info-piece\">
                            <b>Authenticated</b>
                            <span class=\"sf-toolbar-status sf-toolbar-status-{{ collector.authenticated ? 'green' : 'yellow' }}\">{{ collector.authenticated ? 'Yes' : 'No' }}</span>
                        </div>

                        <div class=\"sf-toolbar-info-piece\">
                            <b>Roles</b>
                            <span>
                                {% set remainingRoles = collector.roles|slice(1) %}
                                {{ collector.roles|first }}
                                {% if remainingRoles is not empty %}
                                    +
                                    <abbr title=\"{{ remainingRoles|join(', ') }}\">
                                        {{ remainingRoles|length }} more
                                    </abbr>
                                {% endif %}
                            </span>
                        </div>

                        {% if collector.supportsRoleHierarchy %}
                            <div class=\"sf-toolbar-info-piece\">
                                <b>Inherited Roles</b>
                                <span>
                                    {% if collector.inheritedRoles is empty %}
                                        none
                                    {% else %}
                                        {% set remainingRoles = collector.inheritedRoles|slice(1) %}
                                        {{ collector.inheritedRoles|first }}
                                        {% if remainingRoles is not empty %}
                                            +
                                            <abbr title=\"{{ remainingRoles|join(', ') }}\">
                                                {{ remainingRoles|length }} more
                                            </abbr>
                                        {% endif %}
                                    {% endif %}
                                </span>
                            </div>
                        {% endif %}

                        <div class=\"sf-toolbar-info-piece\">
                            <b>Token class</b>
                            <span>{{ collector.tokenClass|abbr_class }}</span>
                        </div>
                    {% else %}
                        <div class=\"sf-toolbar-info-piece\">
                            <b>Authenticated</b>
                            <span class=\"sf-toolbar-status sf-toolbar-status-yellow\">No</span>
                        </div>
                    {% endif %}

                    {% if collector.firewall %}
                        <div class=\"sf-toolbar-info-piece\">
                            <b>Firewall name</b>
                            <span>{{ collector.firewall.name }}</span>
                        </div>
                    {% endif %}

                    {% if collector.token and collector.logoutUrl %}
                        <div class=\"sf-toolbar-info-piece\">
                            <b>Actions</b>
                            <span>
                                <a href=\"{{ collector.logoutUrl }}\">Logout</a>
                                {% if collector.impersonated and collector.impersonationExitPath %}
                                    | <a href=\"{{ collector.impersonationExitPath }}\">Exit impersonation</a>
                                {% endif %}
                            </span>
                        </div>
                    {% endif %}
                {% else %}
                    <div class=\"sf-toolbar-info-piece\">
                        <span>The security is disabled.</span>
                    </div>
                {% endif %}
            </div>
        {% endset %}

        {{ include('@WebProfiler/Profiler/toolbar_item.html.twig', { link: profiler_url }) }}
    {% endif %}
{% endblock %}

{% block menu %}
    <span class=\"label {{ not collector.firewall or not collector.token ? 'disabled' }}\">
        <span class=\"icon\">{{ source('@Security/Collector/icon.svg') }}</span>
        <strong>Security</strong>
    </span>
{% endblock %}

{% block panel %}
    <h2>Security</h2>
    {% if collector.enabled %}
        <div class=\"sf-tabs\">
            <div class=\"tab {{ collector.token is empty ? 'disabled' }}\">
                <h3 class=\"tab-title\">Token</h3>

                <div class=\"tab-content\">
                    {% if collector.token %}
                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">{{ collector.user }}</span>
                                <span class=\"label\">Username</span>
                            </div>

                            <div class=\"metric\">
                                <span class=\"value\">{{ source('@WebProfiler/Icon/' ~ (collector.authenticated ? 'yes' : 'no') ~ '.svg') }}</span>
                                <span class=\"label\">Authenticated</span>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th scope=\"col\" class=\"key\">Property</th>
                                    <th scope=\"col\">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Roles</th>
                                    <td>
                                        {{ collector.roles is empty ? 'none' : profiler_dump(collector.roles, maxDepth=1) }}

                                        {% if not collector.authenticated and collector.roles is empty %}
                                            <p class=\"help\">User is not authenticated probably because they have no roles.</p>
                                        {% endif %}
                                    </td>
                                </tr>

                                {% if collector.supportsRoleHierarchy %}
                                <tr>
                                    <th>Inherited Roles</th>
                                    <td>{{ collector.inheritedRoles is empty ? 'none' : profiler_dump(collector.inheritedRoles, maxDepth=1) }}</td>
                                </tr>
                                {% endif %}

                                {% if collector.token %}
                                <tr>
                                    <th>Token</th>
                                    <td>{{ profiler_dump(collector.token) }}</td>
                                </tr>
                                {% endif %}
                            </tbody>
                        </table>
                    {% elseif collector.enabled %}
                        <div class=\"empty\">
                            <p>There is no security token.</p>
                        </div>
                    {% endif %}
                </div>
            </div>

            <div class=\"tab {{ (not collector.firewall or collector.firewall.security_enabled is empty) ? 'disabled' }}\">
                <h3 class=\"tab-title\">Firewall</h3>
                <div class=\"tab-content\">
                    {% if collector.firewall %}
                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">{{ collector.firewall.name }}</span>
                                <span class=\"label\">Name</span>
                            </div>
                            <div class=\"metric\">
                                <span class=\"value\">{{ source('@WebProfiler/Icon/' ~ (collector.firewall.security_enabled ? 'yes' : 'no') ~ '.svg') }}</span>
                                <span class=\"label\">Security enabled</span>
                            </div>
                            <div class=\"metric\">
                                <span class=\"value\">{{ source('@WebProfiler/Icon/' ~ (collector.firewall.stateless ? 'yes' : 'no') ~ '.svg') }}</span>
                                <span class=\"label\">Stateless</span>
                            </div>
                        </div>

                        {% if collector.firewall.security_enabled %}
                            <h4>Configuration</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th scope=\"col\" class=\"key\">Key</th>
                                        <th scope=\"col\">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>provider</th>
                                        <td>{{ collector.firewall.provider ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>context</th>
                                        <td>{{ collector.firewall.context ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>entry_point</th>
                                        <td>{{ collector.firewall.entry_point ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>user_checker</th>
                                        <td>{{ collector.firewall.user_checker ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>access_denied_handler</th>
                                        <td>{{ collector.firewall.access_denied_handler ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>access_denied_url</th>
                                        <td>{{ collector.firewall.access_denied_url ?: '(none)' }}</td>
                                    </tr>
                                    <tr>
                                        <th>authenticators</th>
                                        <td>{{ collector.firewall.authenticators is empty ? '(none)' : profiler_dump(collector.firewall.authenticators, maxDepth=1) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        {% endif %}
                    {% endif %}
                </div>
            </div>

            <div class=\"tab {{ collector.listeners|default([]) is empty ? 'disabled' }}\">
                <h3 class=\"tab-title\">Listeners</h3>
                <div class=\"tab-content\">
                    {% if collector.listeners|default([]) is empty %}
                        <div class=\"empty\">
                            <p>No security listeners have been recorded. Check that debugging is enabled in the kernel.</p>
                        </div>
                    {% else %}
                        <table>
                            <thead>
                            <tr>
                                <th>Listener</th>
                                <th>Duration</th>
                                <th>Response</th>
                            </tr>
                            </thead>

                            {% set previous_event = (collector.listeners|first) %}
                            {% for listener in collector.listeners %}
                                {% if loop.first or listener != previous_event %}
                                    {% if not loop.first %}
                                        </tbody>
                                    {% endif %}
                                    <tbody>
                                    {% set previous_event = listener %}
                                {% endif %}

                                <tr>
                                    <td class=\"font-normal\">{{ profiler_dump(listener.stub) }}</td>
                                    <td class=\"no-wrap\">{{ '%0.2f'|format(listener.time * 1000) }} ms</td>
                                    <td class=\"font-normal\">{{ listener.response ? profiler_dump(listener.response) : '(none)' }}</td>
                                </tr>

                                {% if loop.last %}
                                    </tbody>
                                {% endif %}
                            {% endfor %}
                        </table>
                    {% endif %}
                </div>
            </div>

            <div class=\"tab {{ collector.authenticators|default([]) is empty ? 'disabled' }}\">
                <h3 class=\"tab-title\">Authenticators</h3>
                <div class=\"tab-content\">
                    {% if collector.authenticators|default([]) is not empty %}
                        <table>
                            <thead>
                            <tr>
                                <th>Authenticator</th>
                                <th>Supports</th>
                                <th>Duration</th>
                                <th>Passport</th>
                            </tr>
                            </thead>

                            {% set previous_event = (collector.listeners|first) %}
                            {% for authenticator in collector.authenticators %}
                                {% if loop.first or authenticator != previous_event %}
                                    {% if not loop.first %}
                                        </tbody>
                                    {% endif %}

                                    <tbody>
                                    {% set previous_event = authenticator %}
                                {% endif %}

                                <tr>
                                    <td class=\"font-normal\">{{ profiler_dump(authenticator.stub) }}</td>
                                    <td class=\"no-wrap\">{{ source('@WebProfiler/Icon/' ~ (authenticator.supports ? 'yes' : 'no') ~ '.svg') }}</td>
                                    <td class=\"no-wrap\">{{ '%0.2f'|format(authenticator.duration * 1000) }} ms</td>
                                    <td class=\"font-normal\">{{ authenticator.passport ? profiler_dump(authenticator.passport) : '(none)' }}</td>
                                </tr>

                                {% if loop.last %}
                                    </tbody>
                                {% endif %}
                            {% endfor %}
                        </table>
                    {% else %}
                        <div class=\"empty\">
                            <p>No authenticators have been recorded. Check previous profiles on your authentication endpoint.</p>
                        </div>
                    {% endif %}
                </div>
            </div>

            <div class=\"tab {{ collector.accessDecisionLog|default([]) is empty ? 'disabled' }}\">
                <h3 class=\"tab-title\">Access Decision</h3>
                <div class=\"tab-content\">
                    {% if collector.voters|default([]) is not empty %}
                        <div class=\"metrics\">
                            <div class=\"metric\">
                                <span class=\"value\">{{ collector.voterStrategy|default('unknown') }}</span>
                                <span class=\"label\">Strategy</span>
                            </div>
                        </div>

                        <table class=\"voters\">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Voter class</th>
                                </tr>
                            </thead>

                            <tbody>
                                {% for voter in collector.voters %}
                                    <tr>
                                        <td class=\"font-normal text-small text-muted nowrap\">{{ loop.index }}</td>
                                        <td class=\"font-normal\">{{ profiler_dump(voter) }}</td>
                                    </tr>
                                {% endfor %}
                            </tbody>
                        </table>
                    {% endif %}
                    {% if collector.accessDecisionLog|default([]) is not empty %}
                        <h2>Access decision log</h2>

                        <table class=\"decision-log\">
                            <col style=\"width: 30px\">
                            <col style=\"width: 120px\">
                            <col style=\"width: 25%\">
                            <col style=\"width: 60%\">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Result</th>
                                    <th>Attributes</th>
                                    <th>Object</th>
                                </tr>
                            </thead>

                            <tbody>
                                {% for decision in collector.accessDecisionLog %}
                                    <tr class=\"voter_result\">
                                        <td class=\"font-normal text-small text-muted nowrap\">{{ loop.index }}</td>
                                        <td class=\"font-normal\">
                                            {{ decision.result
                                                ? '<span class=\"label status-success same-width\">GRANTED</span>'
                                                : '<span class=\"label status-error same-width\">DENIED</span>'
                                            }}
                                        </td>
                                        <td>
                                            {% if decision.attributes|length == 1 %}
                                                {% set attribute = decision.attributes|first %}
                                                {% if attribute.expression is defined %}
                                                    Expression: <pre><code>{{ attribute.expression }}</code></pre>
                                                {% elseif attribute.type == 'string' %}
                                                    {{ attribute }}
                                                {% else %}
                                                     {{ profiler_dump(attribute) }}
                                                {% endif %}
                                            {% else %}
                                                {{ profiler_dump(decision.attributes) }}
                                            {% endif %}
                                        </td>
                                        <td>{{ profiler_dump(decision.seek('object')) }}</td>
                                    </tr>
                                    <tr class=\"voter_details\">
                                        <td></td>
                                        <td colspan=\"3\">
                                        {% if decision.voter_details is not empty %}
                                            {% set voter_details_id = 'voter-details-' ~ loop.index %}
                                            <div id=\"{{ voter_details_id }}\" class=\"sf-toggle-content sf-toggle-hidden\">
                                                <table>
                                                   <tbody>
                                                    {% for voter_detail in decision.voter_details %}
                                                        <tr>
                                                            <td class=\"font-normal\">{{ profiler_dump(voter_detail['class']) }}</td>
                                                            {% if collector.voterStrategy == 'unanimous' %}
                                                            <td class=\"font-normal text-small\">attribute {{ voter_detail['attributes'][0] }}</td>
                                                            {% endif %}
                                                            <td class=\"font-normal text-small\">
                                                                {% if voter_detail['vote'] == constant('Symfony\\\\Component\\\\Security\\\\Core\\\\Authorization\\\\Voter\\\\VoterInterface::ACCESS_GRANTED') %}
                                                                    ACCESS GRANTED
                                                                {% elseif voter_detail['vote'] == constant('Symfony\\\\Component\\\\Security\\\\Core\\\\Authorization\\\\Voter\\\\VoterInterface::ACCESS_ABSTAIN') %}
                                                                    ACCESS ABSTAIN
                                                                {% elseif voter_detail['vote'] == constant('Symfony\\\\Component\\\\Security\\\\Core\\\\Authorization\\\\Voter\\\\VoterInterface::ACCESS_DENIED') %}
                                                                    ACCESS DENIED
                                                                {% else %}
                                                                    unknown ({{ voter_detail['vote'] }})
                                                                {% endif %}
                                                            </td>
                                                        </tr>
                                                    {% endfor %}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <a class=\"btn btn-link text-small sf-toggle\" data-toggle-selector=\"#{{ voter_details_id }}\" data-toggle-alt-content=\"Hide voter details\">Show voter details</a>
                                        {% endif %}
                                        </td>
                                    </tr>
                                {% endfor %}
                            </tbody>
                        </table>
                    </div>
                {% endif %}
            </div>
        </div>
    {% endif %}
{% endblock %}
", "@Security/Collector/security.html.twig", "/src/vendor/symfony/security-bundle/Resources/views/Collector/security.html.twig");
    }
}
