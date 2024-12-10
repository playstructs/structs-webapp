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

/* @WebProfiler/Profiler/layout.html.twig */
class __TwigTemplate_9d196283d4e35a462abc0617e0a97ea0 extends Template
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
            'body' => [$this, 'block_body'],
            'summary' => [$this, 'block_summary'],
            'sidebar' => [$this, 'block_sidebar'],
            'sidebar_shortcuts_links' => [$this, 'block_sidebar_shortcuts_links'],
            'panel' => [$this, 'block_panel'],
        ];
    }

    protected function doGetParent(array $context): bool|string|Template|TemplateWrapper
    {
        // line 1
        return "@WebProfiler/Profiler/base.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Profiler/layout.html.twig"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "template", "@WebProfiler/Profiler/layout.html.twig"));

        $this->parent = $this->loadTemplate("@WebProfiler/Profiler/base.html.twig", "@WebProfiler/Profiler/layout.html.twig", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

    }

    // line 3
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_body(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "body"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "body"));

        // line 4
        yield "    <div class=\"container\">
        ";
        // line 5
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/header.html.twig", [], false);
        yield "

        <div id=\"summary\">
        ";
        // line 8
        yield from $this->unwrap()->yieldBlock('summary', $context, $blocks);
        // line 112
        yield "    </div>

        <div id=\"content\">
            <div id=\"main\">
                <div id=\"sidebar\">
                    ";
        // line 117
        yield from $this->unwrap()->yieldBlock('sidebar', $context, $blocks);
        // line 156
        yield "                </div>

                <div id=\"collector-wrapper\">
                    <div id=\"collector-content\">
                        ";
        // line 160
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/base_js.html.twig");
        yield "
                        ";
        // line 161
        yield from $this->unwrap()->yieldBlock('panel', $context, $blocks);
        // line 162
        yield "                    </div>
                </div>
            </div>
        </div>
    </div>
";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 8
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_summary(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "summary"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "summary"));

        // line 9
        yield "            ";
        if (array_key_exists("profile", $context)) {
            // line 10
            yield "                ";
            $context["request_collector"] = ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, ($context["profile"] ?? null), "collectors", [], "any", false, true, false, 10), "request", [], "any", true, true, false, 10)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, ($context["profile"] ?? null), "collectors", [], "any", false, true, false, 10), "request", [], "any", false, false, false, 10), false)) : (false));
            // line 11
            yield "                ";
            $context["status_code"] = (((isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 11, $this->source); })())) ? (((CoreExtension::getAttribute($this->env, $this->source, ($context["request_collector"] ?? null), "statuscode", [], "any", true, true, false, 11)) ? (Twig\Extension\CoreExtension::default(CoreExtension::getAttribute($this->env, $this->source, ($context["request_collector"] ?? null), "statuscode", [], "any", false, false, false, 11), 0)) : (0))) : (0));
            // line 12
            yield "                ";
            $context["css_class"] = ((((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 12, $this->source); })()) > 399)) ? ("status-error") : (((((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 12, $this->source); })()) > 299)) ? ("status-warning") : ("status-success"))));
            // line 13
            yield "
                ";
            // line 14
            if (((isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 14, $this->source); })()) && CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 14, $this->source); })()), "redirect", [], "any", false, false, false, 14))) {
                // line 15
                yield "                    ";
                $context["redirect"] = CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 15, $this->source); })()), "redirect", [], "any", false, false, false, 15);
                // line 16
                yield "                    ";
                $context["link_to_source_code"] = ((CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, ($context["redirect"] ?? null), "controller", [], "any", false, true, false, 16), "class", [], "any", true, true, false, 16)) ? ($this->extensions['Symfony\Bridge\Twig\Extension\CodeExtension']->getFileLink(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 16, $this->source); })()), "controller", [], "any", false, false, false, 16), "file", [], "any", false, false, false, 16), CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 16, $this->source); })()), "controller", [], "any", false, false, false, 16), "line", [], "any", false, false, false, 16))) : (""));
                // line 17
                yield "                    ";
                $context["redirect_route_name"] = ("@" . CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 17, $this->source); })()), "route", [], "any", false, false, false, 17));
                // line 18
                yield "
                    <div class=\"status status-compact status-warning\">
                        <span class=\"icon icon-redirect\">";
                // line 20
                yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/redirect.svg");
                yield "</span>

                        <span class=\"status-response-status-code\">";
                // line 22
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 22, $this->source); })()), "status_code", [], "any", false, false, false, 22), "html", null, true);
                yield "</span> redirect from

                        <span class=\"status-request-method\">";
                // line 24
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 24, $this->source); })()), "method", [], "any", false, false, false, 24), "html", null, true);
                yield "</span>

                        ";
                // line 26
                if ((isset($context["link_to_source_code"]) || array_key_exists("link_to_source_code", $context) ? $context["link_to_source_code"] : (function () { throw new RuntimeError('Variable "link_to_source_code" does not exist.', 26, $this->source); })())) {
                    // line 27
                    yield "                            <a href=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["link_to_source_code"]) || array_key_exists("link_to_source_code", $context) ? $context["link_to_source_code"] : (function () { throw new RuntimeError('Variable "link_to_source_code" does not exist.', 27, $this->source); })()), "html", null, true);
                    yield "\" title=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 27, $this->source); })()), "controller", [], "any", false, false, false, 27), "file", [], "any", false, false, false, 27), "html", null, true);
                    yield "\">";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["redirect_route_name"]) || array_key_exists("redirect_route_name", $context) ? $context["redirect_route_name"] : (function () { throw new RuntimeError('Variable "redirect_route_name" does not exist.', 27, $this->source); })()), "html", null, true);
                    yield "</a>
                        ";
                } else {
                    // line 29
                    yield "                            ";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["redirect_route_name"]) || array_key_exists("redirect_route_name", $context) ? $context["redirect_route_name"] : (function () { throw new RuntimeError('Variable "redirect_route_name" does not exist.', 29, $this->source); })()), "html", null, true);
                    yield "
                        ";
                }
                // line 31
                yield "
                        (<a href=\"";
                // line 32
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler", ["token" => CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 32, $this->source); })()), "token", [], "any", false, false, false, 32), "panel" => CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["request"]) || array_key_exists("request", $context) ? $context["request"] : (function () { throw new RuntimeError('Variable "request" does not exist.', 32, $this->source); })()), "query", [], "any", false, false, false, 32), "get", ["panel", "request"], "method", false, false, false, 32)]), "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["redirect"]) || array_key_exists("redirect", $context) ? $context["redirect"] : (function () { throw new RuntimeError('Variable "redirect" does not exist.', 32, $this->source); })()), "token", [], "any", false, false, false, 32), "html", null, true);
                yield "</a>)
                    </div>
                ";
            }
            // line 35
            yield "
                <div class=\"status ";
            // line 36
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["css_class"]) || array_key_exists("css_class", $context) ? $context["css_class"] : (function () { throw new RuntimeError('Variable "css_class" does not exist.', 36, $this->source); })()), "html", null, true);
            yield "\">
                    ";
            // line 37
            if (((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 37, $this->source); })()) > 399)) {
                // line 38
                yield "                        <p class=\"status-error-details\">
                            <span class=\"icon\">";
                // line 39
                yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/alert-circle.svg");
                yield "</span>
                            <span class=\"status-response-status-code\">Error ";
                // line 40
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 40, $this->source); })()), "html", null, true);
                yield "</span>
                            <span class=\"status-response-status-text\">";
                // line 41
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 41, $this->source); })()), "statusText", [], "any", false, false, false, 41), "html", null, true);
                yield "</span>
                        </p>
                    ";
            }
            // line 44
            yield "
                    <h2>
                        <span class=\"status-request-method\">
                            ";
            // line 47
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::upper($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 47, $this->source); })()), "method", [], "any", false, false, false, 47)), "html", null, true);
            yield "
                        </span>

                        ";
            // line 50
            $context["profile_title"] = (((Twig\Extension\CoreExtension::length($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 50, $this->source); })()), "url", [], "any", false, false, false, 50)) < 160)) ? (CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 50, $this->source); })()), "url", [], "any", false, false, false, 50)) : ((Twig\Extension\CoreExtension::slice($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 50, $this->source); })()), "url", [], "any", false, false, false, 50), 0, 160) . "…")));
            // line 51
            yield "                        ";
            if (CoreExtension::inFilter(Twig\Extension\CoreExtension::upper($this->env->getCharset(), CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 51, $this->source); })()), "method", [], "any", false, false, false, 51)), ["GET", "HEAD"])) {
                // line 52
                yield "                            <a href=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 52, $this->source); })()), "url", [], "any", false, false, false, 52), "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["profile_title"]) || array_key_exists("profile_title", $context) ? $context["profile_title"] : (function () { throw new RuntimeError('Variable "profile_title" does not exist.', 52, $this->source); })()), "html", null, true);
                yield "</a>
                        ";
            } else {
                // line 54
                yield "                            ";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["profile_title"]) || array_key_exists("profile_title", $context) ? $context["profile_title"] : (function () { throw new RuntimeError('Variable "profile_title" does not exist.', 54, $this->source); })()), "html", null, true);
                yield "
                        ";
            }
            // line 56
            yield "                    </h2>

                    <dl class=\"metadata\">
                        ";
            // line 59
            if (((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 59, $this->source); })()) < 400)) {
                // line 60
                yield "                            <dt>Response</dt>
                            <dd>
                                <span class=\"status-response-status-code\">";
                // line 62
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["status_code"]) || array_key_exists("status_code", $context) ? $context["status_code"] : (function () { throw new RuntimeError('Variable "status_code" does not exist.', 62, $this->source); })()), "html", null, true);
                yield "</span>
                                <span class=\"status-response-status-text\">";
                // line 63
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 63, $this->source); })()), "statusText", [], "any", false, false, false, 63), "html", null, true);
                yield "</span>
                            </dd>
                        ";
            }
            // line 66
            yield "
                        ";
            // line 67
            $context["referer"] = (((isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 67, $this->source); })())) ? (CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 67, $this->source); })()), "requestheaders", [], "any", false, false, false, 67), "get", ["referer"], "method", false, false, false, 67)) : (null));
            // line 68
            yield "                        ";
            if ((isset($context["referer"]) || array_key_exists("referer", $context) ? $context["referer"] : (function () { throw new RuntimeError('Variable "referer" does not exist.', 68, $this->source); })())) {
                // line 69
                yield "                            <dt></dt>
                            <dd>
                                <span class=\"icon icon-referer\">";
                // line 71
                yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/referrer.svg");
                yield "</span>
                                <a href=\"";
                // line 72
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["referer"]) || array_key_exists("referer", $context) ? $context["referer"] : (function () { throw new RuntimeError('Variable "referer" does not exist.', 72, $this->source); })()), "html", null, true);
                yield "\" class=\"referer\">Browse referrer URL</a>
                            </dd>
                        ";
            }
            // line 75
            yield "
                        <dt>IP</dt>
                        <dd>
                            <a href=\"";
            // line 78
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler_search_results", ["token" => (isset($context["token"]) || array_key_exists("token", $context) ? $context["token"] : (function () { throw new RuntimeError('Variable "token" does not exist.', 78, $this->source); })()), "limit" => 10, "ip" => CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 78, $this->source); })()), "ip", [], "any", false, false, false, 78)]), "html", null, true);
            yield "\">";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 78, $this->source); })()), "ip", [], "any", false, false, false, 78), "html", null, true);
            yield "</a>
                        </dd>

                        <dt>Profiled on</dt>
                        <dd><time data-convert-to-user-timezone data-render-as-datetime datetime=\"";
            // line 82
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Twig\Extension\CoreExtension']->formatDate(CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 82, $this->source); })()), "time", [], "any", false, false, false, 82), "c"), "html", null, true);
            yield "\">";
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Twig\Extension\CoreExtension']->formatDate(CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 82, $this->source); })()), "time", [], "any", false, false, false, 82), "r"), "html", null, true);
            yield "</time></dd>

                        <dt>Token</dt>
                        <dd>";
            // line 85
            yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 85, $this->source); })()), "token", [], "any", false, false, false, 85), "html", null, true);
            yield "</dd>
                    </dl>
                </div>

                ";
            // line 89
            if (((isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 89, $this->source); })()) && CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 89, $this->source); })()), "forwardtoken", [], "any", false, false, false, 89))) {
                // line 90
                $context["forward_profile"] = CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 90, $this->source); })()), "childByToken", [CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 90, $this->source); })()), "forwardtoken", [], "any", false, false, false, 90)], "method", false, false, false, 90);
                // line 91
                yield "                    ";
                $context["controller"] = (((isset($context["forward_profile"]) || array_key_exists("forward_profile", $context) ? $context["forward_profile"] : (function () { throw new RuntimeError('Variable "forward_profile" does not exist.', 91, $this->source); })())) ? (CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["forward_profile"]) || array_key_exists("forward_profile", $context) ? $context["forward_profile"] : (function () { throw new RuntimeError('Variable "forward_profile" does not exist.', 91, $this->source); })()), "collector", ["request"], "method", false, false, false, 91), "controller", [], "any", false, false, false, 91)) : ("n/a"));
                // line 92
                yield "                    <div class=\"status status-compact status-compact-forward\">
                        <span class=\"icon icon-forward\">";
                // line 93
                yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/forward.svg");
                yield "</span>

                        Forwarded to

                            ";
                // line 97
                $context["link"] = ((CoreExtension::getAttribute($this->env, $this->source, ($context["controller"] ?? null), "file", [], "any", true, true, false, 97)) ? ($this->extensions['Symfony\Bridge\Twig\Extension\CodeExtension']->getFileLink(CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 97, $this->source); })()), "file", [], "any", false, false, false, 97), CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 97, $this->source); })()), "line", [], "any", false, false, false, 97))) : (null));
                // line 98
                if ((isset($context["link"]) || array_key_exists("link", $context) ? $context["link"] : (function () { throw new RuntimeError('Variable "link" does not exist.', 98, $this->source); })())) {
                    yield "<a href=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["link"]) || array_key_exists("link", $context) ? $context["link"] : (function () { throw new RuntimeError('Variable "link" does not exist.', 98, $this->source); })()), "html", null, true);
                    yield "\" title=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 98, $this->source); })()), "file", [], "any", false, false, false, 98), "html", null, true);
                    yield "\">";
                }
                // line 99
                if (CoreExtension::getAttribute($this->env, $this->source, ($context["controller"] ?? null), "class", [], "any", true, true, false, 99)) {
                    // line 100
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(Twig\Extension\CoreExtension::striptags($this->extensions['Symfony\Bridge\Twig\Extension\CodeExtension']->abbrClass($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 100, $this->source); })()), "class", [], "any", false, false, false, 100), "html", null, true))), "html", null, true);
                    // line 101
                    yield ((CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 101, $this->source); })()), "method", [], "any", false, false, false, 101)) ? ($this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((" :: " . CoreExtension::getAttribute($this->env, $this->source, (isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 101, $this->source); })()), "method", [], "any", false, false, false, 101)), "html", null, true)) : (""));
                } else {
                    // line 103
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape((isset($context["controller"]) || array_key_exists("controller", $context) ? $context["controller"] : (function () { throw new RuntimeError('Variable "controller" does not exist.', 103, $this->source); })()), "html", null, true);
                }
                // line 105
                if ((isset($context["link"]) || array_key_exists("link", $context) ? $context["link"] : (function () { throw new RuntimeError('Variable "link" does not exist.', 105, $this->source); })())) {
                    yield "</a>";
                }
                // line 106
                yield "                            (<a href=\"";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler", ["token" => CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 106, $this->source); })()), "forwardtoken", [], "any", false, false, false, 106)]), "html", null, true);
                yield "\">";
                yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, (isset($context["request_collector"]) || array_key_exists("request_collector", $context) ? $context["request_collector"] : (function () { throw new RuntimeError('Variable "request_collector" does not exist.', 106, $this->source); })()), "forwardtoken", [], "any", false, false, false, 106), "html", null, true);
                yield "</a>)

                    </div>";
            }
            // line 110
            yield "            ";
        }
        // line 111
        yield "        ";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 117
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_sidebar(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "sidebar"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "sidebar"));

        // line 118
        yield "                        <div id=\"sidebar-contents\">
                            <div id=\"sidebar-shortcuts\">
                                ";
        // line 120
        yield from $this->unwrap()->yieldBlock('sidebar_shortcuts_links', $context, $blocks);
        // line 130
        yield "
                                ";
        // line 131
        yield $this->env->getRuntime('Symfony\Bridge\Twig\Extension\HttpKernelRuntime')->renderFragment(Symfony\Bridge\Twig\Extension\HttpKernelExtension::controller("web_profiler.controller.profiler::searchBarAction", [], CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["request"]) || array_key_exists("request", $context) ? $context["request"] : (function () { throw new RuntimeError('Variable "request" does not exist.', 131, $this->source); })()), "query", [], "any", false, false, false, 131), "all", [], "any", false, false, false, 131)));
        yield "
                            </div>

                            ";
        // line 134
        if (array_key_exists("templates", $context)) {
            // line 135
            yield "                                <ul id=\"menu-profiler\">
                                    ";
            // line 136
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable((isset($context["templates"]) || array_key_exists("templates", $context) ? $context["templates"] : (function () { throw new RuntimeError('Variable "templates" does not exist.', 136, $this->source); })()));
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
            foreach ($context['_seq'] as $context["name"] => $context["template"]) {
                // line 137
                yield "                                        ";
                $context["menu"] = ('' === $tmp = \Twig\Extension\CoreExtension::captureOutput((function () use (&$context, $macros, $blocks) {
                    // line 138
                    if (                    $this->loadTemplate($context["template"], "@WebProfiler/Profiler/layout.html.twig", 138)->unwrap()->hasBlock("menu", $context)) {
                        // line 139
                        $_v0 = $context;
                        $_v1 = ["collector" => CoreExtension::getAttribute($this->env, $this->source, (isset($context["profile"]) || array_key_exists("profile", $context) ? $context["profile"] : (function () { throw new RuntimeError('Variable "profile" does not exist.', 139, $this->source); })()), "getcollector", [$context["name"]], "method", false, false, false, 139), "profiler_markup_version" => (isset($context["profiler_markup_version"]) || array_key_exists("profiler_markup_version", $context) ? $context["profiler_markup_version"] : (function () { throw new RuntimeError('Variable "profiler_markup_version" does not exist.', 139, $this->source); })())];
                        if (!is_iterable($_v1)) {
                            throw new RuntimeError('Variables passed to the "with" tag must be a mapping.', 139, $this->getSourceContext());
                        }
                        $_v1 = CoreExtension::toArray($_v1);
                        $context = $_v1 + $context + $this->env->getGlobals();
                        // line 140
                        yield from                         $this->loadTemplate($context["template"], "@WebProfiler/Profiler/layout.html.twig", 140)->unwrap()->yieldBlock("menu", $context);
                        $context = $_v0;
                    }
                    yield from [];
                })())) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 144
                yield "                                        ";
                if ( !Twig\Extension\CoreExtension::testEmpty((isset($context["menu"]) || array_key_exists("menu", $context) ? $context["menu"] : (function () { throw new RuntimeError('Variable "menu" does not exist.', 144, $this->source); })()))) {
                    // line 145
                    yield "                                            <li class=\"";
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($context["name"], "html", null, true);
                    yield " ";
                    yield ((($context["name"] == (isset($context["panel"]) || array_key_exists("panel", $context) ? $context["panel"] : (function () { throw new RuntimeError('Variable "panel" does not exist.', 145, $this->source); })()))) ? ("selected") : (""));
                    yield "\">
                                                <a href=\"";
                    // line 146
                    yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler", ["token" => (isset($context["token"]) || array_key_exists("token", $context) ? $context["token"] : (function () { throw new RuntimeError('Variable "token" does not exist.', 146, $this->source); })()), "panel" => $context["name"]]), "html", null, true);
                    yield "\">";
                    yield (isset($context["menu"]) || array_key_exists("menu", $context) ? $context["menu"] : (function () { throw new RuntimeError('Variable "menu" does not exist.', 146, $this->source); })());
                    yield "</a>
                                            </li>
                                        ";
                }
                // line 149
                yield "                                    ";
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
            unset($context['_seq'], $context['name'], $context['template'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 150
            yield "                                </ul>
                            ";
        }
        // line 152
        yield "                        </div>

                        ";
        // line 154
        yield Twig\Extension\CoreExtension::include($this->env, $context, "@WebProfiler/Profiler/settings.html.twig");
        yield "
                    ";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 120
    /**
     * @return iterable<null|scalar|\Stringable>
     */
    public function block_sidebar_shortcuts_links(array $context, array $blocks = []): iterable
    {
        $macros = $this->macros;
        $__internal_5a27a8ba21ca79b61932376b2fa922d2 = $this->extensions["Symfony\\Bundle\\WebProfilerBundle\\Twig\\WebProfilerExtension"];
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->enter($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "sidebar_shortcuts_links"));

        $__internal_6f47bbe9983af81f1e7450e9a3e3768f = $this->extensions["Symfony\\Bridge\\Twig\\Extension\\ProfilerExtension"];
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->enter($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof = new \Twig\Profiler\Profile($this->getTemplateName(), "block", "sidebar_shortcuts_links"));

        // line 121
        yield "                                    <div class=\"shortcuts\">
                                        <a class=\"btn btn-link\" href=\"";
        // line 122
        yield $this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler_search", ["limit" => 10]);
        yield "\">Last 10</a>
                                        <a class=\"btn btn-link\" href=\"";
        // line 123
        yield $this->env->getRuntime('Twig\Runtime\EscaperRuntime')->escape($this->extensions['Symfony\Bridge\Twig\Extension\RoutingExtension']->getPath("_profiler", Twig\Extension\CoreExtension::merge(["token" => "latest"], CoreExtension::getAttribute($this->env, $this->source, CoreExtension::getAttribute($this->env, $this->source, (isset($context["request"]) || array_key_exists("request", $context) ? $context["request"] : (function () { throw new RuntimeError('Variable "request" does not exist.', 123, $this->source); })()), "query", [], "any", false, false, false, 123), "all", [], "any", false, false, false, 123))), "html", null, true);
        yield "\">Latest</a>

                                        <a class=\"sf-toggle btn btn-link\" data-toggle-selector=\"#sidebar-search\" ";
        // line 125
        if ((array_key_exists("tokens", $context) || array_key_exists("about", $context))) {
            yield "data-toggle-initial=\"display\"";
        }
        yield ">
                                            ";
        // line 126
        yield Twig\Extension\CoreExtension::source($this->env, "@WebProfiler/Icon/search.svg");
        yield " <span class=\"hidden-small\">Search</span>
                                        </a>
                                    </div>
                                ";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    // line 161
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

        yield "";
        
        $__internal_6f47bbe9983af81f1e7450e9a3e3768f->leave($__internal_6f47bbe9983af81f1e7450e9a3e3768f_prof);

        
        $__internal_5a27a8ba21ca79b61932376b2fa922d2->leave($__internal_5a27a8ba21ca79b61932376b2fa922d2_prof);

        yield from [];
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName(): string
    {
        return "@WebProfiler/Profiler/layout.html.twig";
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
        return array (  575 => 161,  560 => 126,  554 => 125,  549 => 123,  545 => 122,  542 => 121,  529 => 120,  516 => 154,  512 => 152,  508 => 150,  494 => 149,  486 => 146,  479 => 145,  476 => 144,  470 => 140,  462 => 139,  460 => 138,  457 => 137,  440 => 136,  437 => 135,  435 => 134,  429 => 131,  426 => 130,  424 => 120,  420 => 118,  407 => 117,  396 => 111,  393 => 110,  384 => 106,  380 => 105,  377 => 103,  374 => 101,  372 => 100,  370 => 99,  362 => 98,  360 => 97,  353 => 93,  350 => 92,  347 => 91,  345 => 90,  343 => 89,  336 => 85,  328 => 82,  319 => 78,  314 => 75,  308 => 72,  304 => 71,  300 => 69,  297 => 68,  295 => 67,  292 => 66,  286 => 63,  282 => 62,  278 => 60,  276 => 59,  271 => 56,  265 => 54,  257 => 52,  254 => 51,  252 => 50,  246 => 47,  241 => 44,  235 => 41,  231 => 40,  227 => 39,  224 => 38,  222 => 37,  218 => 36,  215 => 35,  207 => 32,  204 => 31,  198 => 29,  188 => 27,  186 => 26,  181 => 24,  176 => 22,  171 => 20,  167 => 18,  164 => 17,  161 => 16,  158 => 15,  156 => 14,  153 => 13,  150 => 12,  147 => 11,  144 => 10,  141 => 9,  128 => 8,  112 => 162,  110 => 161,  106 => 160,  100 => 156,  98 => 117,  91 => 112,  89 => 8,  83 => 5,  80 => 4,  67 => 3,  44 => 1,);
    }

    public function getSourceContext(): Source
    {
        return new Source("{% extends '@WebProfiler/Profiler/base.html.twig' %}

{% block body %}
    <div class=\"container\">
        {{ include('@WebProfiler/Profiler/header.html.twig', with_context = false) }}

        <div id=\"summary\">
        {% block summary %}
            {% if profile is defined %}
                {% set request_collector = profile.collectors.request|default(false) %}
                {% set status_code = request_collector ? request_collector.statuscode|default(0) : 0 %}
                {% set css_class = status_code > 399 ? 'status-error' : status_code > 299 ? 'status-warning' : 'status-success' %}

                {% if request_collector and request_collector.redirect %}
                    {% set redirect = request_collector.redirect %}
                    {% set link_to_source_code = redirect.controller.class is defined ? redirect.controller.file|file_link(redirect.controller.line) %}
                    {% set redirect_route_name = '@' ~ redirect.route %}

                    <div class=\"status status-compact status-warning\">
                        <span class=\"icon icon-redirect\">{{ source('@WebProfiler/Icon/redirect.svg') }}</span>

                        <span class=\"status-response-status-code\">{{ redirect.status_code }}</span> redirect from

                        <span class=\"status-request-method\">{{ redirect.method }}</span>

                        {% if link_to_source_code %}
                            <a href=\"{{ link_to_source_code }}\" title=\"{{ redirect.controller.file }}\">{{ redirect_route_name }}</a>
                        {% else %}
                            {{ redirect_route_name }}
                        {% endif %}

                        (<a href=\"{{ path('_profiler', { token: redirect.token, panel: request.query.get('panel', 'request') }) }}\">{{ redirect.token }}</a>)
                    </div>
                {% endif %}

                <div class=\"status {{ css_class }}\">
                    {% if status_code > 399 %}
                        <p class=\"status-error-details\">
                            <span class=\"icon\">{{ source('@WebProfiler/Icon/alert-circle.svg') }}</span>
                            <span class=\"status-response-status-code\">Error {{ status_code }}</span>
                            <span class=\"status-response-status-text\">{{ request_collector.statusText }}</span>
                        </p>
                    {% endif %}

                    <h2>
                        <span class=\"status-request-method\">
                            {{ profile.method|upper }}
                        </span>

                        {% set profile_title = profile.url|length < 160 ? profile.url : profile.url[:160] ~ '…' %}
                        {% if profile.method|upper in ['GET', 'HEAD'] %}
                            <a href=\"{{ profile.url }}\">{{ profile_title }}</a>
                        {% else %}
                            {{ profile_title }}
                        {% endif %}
                    </h2>

                    <dl class=\"metadata\">
                        {% if status_code < 400 %}
                            <dt>Response</dt>
                            <dd>
                                <span class=\"status-response-status-code\">{{ status_code }}</span>
                                <span class=\"status-response-status-text\">{{ request_collector.statusText }}</span>
                            </dd>
                        {% endif %}

                        {% set referer = request_collector ? request_collector.requestheaders.get('referer') : null %}
                        {% if referer %}
                            <dt></dt>
                            <dd>
                                <span class=\"icon icon-referer\">{{ source('@WebProfiler/Icon/referrer.svg') }}</span>
                                <a href=\"{{ referer }}\" class=\"referer\">Browse referrer URL</a>
                            </dd>
                        {% endif %}

                        <dt>IP</dt>
                        <dd>
                            <a href=\"{{ path('_profiler_search_results', { token: token, limit: 10, ip: profile.ip }) }}\">{{ profile.ip }}</a>
                        </dd>

                        <dt>Profiled on</dt>
                        <dd><time data-convert-to-user-timezone data-render-as-datetime datetime=\"{{ profile.time|date('c') }}\">{{ profile.time|date('r') }}</time></dd>

                        <dt>Token</dt>
                        <dd>{{ profile.token }}</dd>
                    </dl>
                </div>

                {% if request_collector and request_collector.forwardtoken -%}
                    {% set forward_profile = profile.childByToken(request_collector.forwardtoken) %}
                    {% set controller = forward_profile ? forward_profile.collector('request').controller : 'n/a' %}
                    <div class=\"status status-compact status-compact-forward\">
                        <span class=\"icon icon-forward\">{{ source('@WebProfiler/Icon/forward.svg') }}</span>

                        Forwarded to

                            {% set link = controller.file is defined ? controller.file|file_link(controller.line) : null -%}
                            {%- if link %}<a href=\"{{ link }}\" title=\"{{ controller.file }}\">{% endif -%}
                                {% if controller.class is defined %}
                                    {{- controller.class|abbr_class|striptags -}}
                                    {{- controller.method ? ' :: ' ~ controller.method -}}
                                {% else %}
                                    {{- controller -}}
                                {% endif %}
                                {%- if link %}</a>{% endif %}
                            (<a href=\"{{ path('_profiler', { token: request_collector.forwardtoken }) }}\">{{ request_collector.forwardtoken }}</a>)

                    </div>
                {%- endif %}
            {% endif %}
        {% endblock %}
    </div>

        <div id=\"content\">
            <div id=\"main\">
                <div id=\"sidebar\">
                    {% block sidebar %}
                        <div id=\"sidebar-contents\">
                            <div id=\"sidebar-shortcuts\">
                                {% block sidebar_shortcuts_links %}
                                    <div class=\"shortcuts\">
                                        <a class=\"btn btn-link\" href=\"{{ path('_profiler_search', { limit: 10 }) }}\">Last 10</a>
                                        <a class=\"btn btn-link\" href=\"{{ path('_profiler', { token: 'latest' }|merge(request.query.all)) }}\">Latest</a>

                                        <a class=\"sf-toggle btn btn-link\" data-toggle-selector=\"#sidebar-search\" {% if tokens is defined or about is defined %}data-toggle-initial=\"display\"{% endif %}>
                                            {{ source('@WebProfiler/Icon/search.svg') }} <span class=\"hidden-small\">Search</span>
                                        </a>
                                    </div>
                                {% endblock sidebar_shortcuts_links %}

                                {{ render(controller('web_profiler.controller.profiler::searchBarAction', query=request.query.all)) }}
                            </div>

                            {% if templates is defined %}
                                <ul id=\"menu-profiler\">
                                    {% for name, template in templates %}
                                        {% set menu -%}
                                            {%- if block('menu', template) is defined -%}
                                                {% with { collector: profile.getcollector(name), profiler_markup_version: profiler_markup_version } %}
                                                    {{- block('menu', template) -}}
                                                {% endwith %}
                                            {%- endif -%}
                                        {%- endset %}
                                        {% if menu is not empty %}
                                            <li class=\"{{ name }} {{ name == panel ? 'selected' }}\">
                                                <a href=\"{{ path('_profiler', { token: token, panel: name }) }}\">{{ menu|raw }}</a>
                                            </li>
                                        {% endif %}
                                    {% endfor %}
                                </ul>
                            {% endif %}
                        </div>

                        {{ include('@WebProfiler/Profiler/settings.html.twig') }}
                    {% endblock sidebar %}
                </div>

                <div id=\"collector-wrapper\">
                    <div id=\"collector-content\">
                        {{ include('@WebProfiler/Profiler/base_js.html.twig') }}
                        {% block panel '' %}
                    </div>
                </div>
            </div>
        </div>
    </div>
{% endblock %}
", "@WebProfiler/Profiler/layout.html.twig", "/src/vendor/symfony/web-profiler-bundle/Resources/views/Profiler/layout.html.twig");
    }
}
